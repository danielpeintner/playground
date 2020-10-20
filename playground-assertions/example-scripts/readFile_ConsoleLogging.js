// Test utility to test index.js
const tdAsserter = require("../index")
const fs = require("fs")
const path = require("path")

// Reads file in as Buffer
simpleTD = fs.readFileSync(path.join(__dirname, "../", "node_modules", "playground-core", "examples", "tds", "valid", "simple.json"))

function fileLoad(loc) {
	return new Promise( (res, rej) => {
		fs.readFile(loc, "utf8", (err, data) => {
			if (err) {rej(err)}
			else {res(data)}
		})
	})
}


tdAsserter([simpleTD], fileLoad, console.log)
.then( result => {
	console.log("OKAY")
}, err => {
	console.log("ERROR")
	console.error(err)
})
