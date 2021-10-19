require("dotenv").config();
const puppeteer = require('puppeteer');
const mongoose = require("mongoose");
var RedG = require("./dataSchema");
const db = mongoose.connection;
db.on("error", (e) => console.log(`error is ${e}`));
db.once("open", () => console.log("Database is connected"));

var searchTerm = "";


(async () => {
    await mongoose.connect(process.env.DB_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    const browser = await puppeteer.launch({  headless: false, });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1000 })


    //block images
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() === 'image' || req.resourceType() === 'media') {
            req.abort();
        }
        else {
            req.continue();
        }
    })
    await page.goto(process.env.URL, {
        waitUntil: 'networkidle2',
    });

    var docCount = 1;
    var closeProgram = false;
    for (let i = 0; i < 2000; i++) {
        await page.waitForSelector(".tag-list");
        console.log("Page: ", i);

        await sleep(200)

        let finalList = await page.evaluate(async () => {

            function sleep(time) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, time);
                })
            }
            let finalList = [];


            document.querySelector(".paginator").scrollIntoView()
            await sleep(300)
            let itemList = document.querySelectorAll(".horizontal-grid__item");

            // console.log(finalList)
            itemList.forEach(item => {
                try {
                    // item.scrollIntoView()
                    // console.log(item)
                    let height = item.querySelector("video").height;
                    let width = item.querySelector("video").width;
                    let source = item.querySelector("video source").src.replace("-mobile", "");
                    let tags = item.querySelector(".tags").textContent.split("#").map(i => i.trim()).filter(i => i.length);
                    let tagSearchIndex = tags.join(" | ");
                    let _id = item.querySelector("video").id.replace("video-", "")
                    finalList.push({ source, tags, _id, resolution: { height, width }, tagSearchIndex });
                } catch (e) {
                    console.log("Error")
                }
            })
            return finalList
        });

        console.log(/*finalList.map(i => { return { source: i.source, res: i.resolution } }),*/ finalList.length);
        
        var isDisabled = await page.evaluate(() => {
            return document.querySelector(".paginator__next-button").classList.contains("disabled")
        })


        if (i < 0) {
            // await sleep(300);
            try {
                let dataSet = await RedG.insertMany(finalList, { ordered: false, })
                console.log(dataSet.map(i=>i._id));
            } catch (e) { console.log("-----", e.message) }

        } else {
            for (let k = 0; k < finalList.length; k++) {
                try {
                    const newRedG = new RedG(finalList[k]);
                    await newRedG.save();
                    console.log(docCount, ": ", finalList[k]._id, finalList[k].source);
                    docCount++;
                } catch (e) {
                    console.log("---", e.message, "---", parseInt(Math.random() * 10));
                }
            }
        }

        if (!isDisabled) {
            await page.click(".paginator__next-button");
            closeProgram = false;
        } else {
            if(closeProgram) {
                browser.close();
                console.log("Done 😀😀")
                break;
            } else {
                await sleep(10000);
                closeProgram = true;
            }
        }

    }
    db.close();
})();

function sleep(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    })
}