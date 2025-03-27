import cron from "cron";
import https from "https";

const job = new cron.CronJob("0 */14 * * * *", async () => {
  https
    .get("https://tech-verse-app.onrender.com/", (res) => {
      if (res.statusCode === 200)
        console.log("GET request sent to server successfully.");
      else console.log("GET request failed.", res.statusCode);
    })
    .on("error", (e) => console.log("Error while sending request:", e));
});

export default job;
