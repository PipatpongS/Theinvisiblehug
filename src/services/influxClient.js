import { InfluxDB } from "@influxdata/influxdb-client";

// ================= CONFIG: INFLUXDB =================
const INFLUXDB_URL = "https://us-east-1-1.aws.cloud2.influxdata.com";
const INFLUXDB_TOKEN = "Xs4k_6XWlI2Yv0UGxGpK6SW8m922HZGqn65xStfdbeyroeoNbOgdIqYPypDsQ9Hqmq2ewZzZPnttBRywIWNizg==";
const INFLUXDB_ORG = "97eb4fb19476e566"; // เปลี่ยนเป็น Org ID ของคุณ (97eb4fb19476e566)
const INFLUXDB_BUCKET = "jcc_data";
// ====================================================

const influxDB = new InfluxDB({ url: INFLUXDB_URL, token: INFLUXDB_TOKEN });

/**
 * ดึงข้อมูลย้อนหลัง (History) จาก InfluxDB
 * @param {string} range เช่น '-30d' (ย้อนหลัง 30 วัน), '-1h' (ย้อนหลัง 1 ชม.)
 */
export const fetchHistory = async (range = "-24h", aggregate = "1m") => {
  const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);

  // คำสั่ง Flux Query เพื่อดึงค่า bpm, temp, gsr 
  const fluxQuery = `
    from(bucket: "${INFLUXDB_BUCKET}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "patient_status")
      |> filter(fn: (r) => r._field == "bpm" or r._field == "temp" or r._field == "gsr" or r._field == "imu")
      |> aggregateWindow(every: ${aggregate}, fn: mean, createEmpty: false)
      |> yield(name: "mean")
  `;

  console.log("Fetching history from InfluxDB...");
  
  return new Promise((resolve, reject) => {
    const rawData = [];
    queryApi.queryRows(fluxQuery, {
      next: (row, tableMeta) => {
        const o = tableMeta.toObject(row);
        rawData.push({
          time: o._time,
          field: o._field,
          value: o._value,
        });
      },
      error: (error) => {
        console.error("InfluxDB Query Error:", error);
        reject(error);
      },
      complete: () => {
        console.log("InfluxDB Query Completed.");
        // แปลงข้อมูลให้อยู่ในรูปแบบที่ Recharts วาดกราฟได้ง่ายๆ
        // { "2024-07-01T10:00": { time: "...", bpm: 80, temp: 36.5 } }
        const formattedData = {};
        
        rawData.forEach((item) => {
          const timeKey = new Date(item.time).toLocaleString(); // แปลงเวลาให้อ่านง่าย
          if (!formattedData[timeKey]) {
            formattedData[timeKey] = { time: timeKey };
          }
          formattedData[timeKey][item.field] = item.value;
        });

        // คืนค่าเป็น Array เรียงตามเวลา
        resolve(Object.values(formattedData));
      },
    });
  });
};

/**
 * ดึงข้อมูลสถิติของวันนี้ (ตั้งแต่เที่ยงคืน)
 */
export const fetchDailyStats = async () => {
  const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);

  // หาเวลาเที่ยงคืนของวันนี้ตามเวลา Local (ไทย)
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const startIso = now.toISOString();

  // ดึงข้อมูลหยาบๆ ทุกๆ 1 นาที เพื่อนำมาคำนวณสถิติ (ป้องกันข้อมูลใหญ่เกินไป)
  const fluxQuery = `
    from(bucket: "${INFLUXDB_BUCKET}")
      |> range(start: ${startIso})
      |> filter(fn: (r) => r._measurement == "patient_status")
      |> filter(fn: (r) => r._field == "bpm" or r._field == "temp" or r._field == "gsr" or r._field == "imu")
      |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
      |> yield(name: "mean")
  `;

  return new Promise((resolve, reject) => {
    const stats = {
      bpm: { sum: 0, count: 0, min: Infinity, max: -Infinity, values: [] },
      temp: { sum: 0, count: 0, min: Infinity, max: -Infinity, values: [] },
      gsr: { sum: 0, count: 0, min: Infinity, max: -Infinity, values: [] },
      imu: { sum: 0, count: 0, min: Infinity, max: -Infinity, values: [] }
    };

    queryApi.queryRows(fluxQuery, {
      next: (row, tableMeta) => {
        const o = tableMeta.toObject(row);
        const f = o._field;
        const v = o._value;
        if (stats[f] && v !== null && v !== undefined) {
          stats[f].sum += v;
          stats[f].count += 1;
          if (v < stats[f].min) stats[f].min = v;
          if (v > stats[f].max) stats[f].max = v;
          stats[f].values.push(v);
        }
      },
      error: (error) => {
        console.error("InfluxDB Daily Stats Error:", error);
        reject(error);
      },
      complete: () => {
        const result = {};
        for (const [field, data] of Object.entries(stats)) {
          if (data.count === 0) {
            result[field] = { avg: 0, min: 0, max: 0, std: 0 };
            continue;
          }
          const avg = data.sum / data.count;
          const variance = data.values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / data.count;
          const std = Math.sqrt(variance);
          result[field] = { avg, min: data.min, max: data.max, std };
        }
        resolve(result);
      }
    });
  });
};
