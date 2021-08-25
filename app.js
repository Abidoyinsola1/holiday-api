const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const axios = require('axios').default;
require('dotenv').config()
const _ = require(`${__dirname}/country.js`)
const app = express()
const port = 4000

app.set('view engine', 'ejs')
app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.urlencoded({ extended: true }))
mongoose.connect('mongodb://localhost:27017/searchDB', { useNewUrlParser: true, useUnifiedTopology: true });

var country = 'NG'
const searchSchema = mongoose.Schema({
    searchedItem: String,
    updated: {
        type: Date,
        default: Date.now
    }
})

const Search = mongoose.model('search', searchSchema)


app.get('/', async (req, res) => {
    const apiKey = process.env.API_KEY
    const url = `https://holidayapi.com/v1/holidays?pretty&key=${apiKey}&country=${country}&year=2020`

    try {

        const response = await axios.get(url);

        console.log(response.data)
        const holidays = response.data.holidays
        res.render('index', {
            heading: 'Home Page',
            countryDetails: _,
            holidayDisplay: holidays
        })
    } catch (error) {
        console.error(error);
    }

})

app.get('/track', (req, res) => {
    Search.find({}, function (err, docs) {
        if (err) {
            console.log(err)
        } else {
            res.render('track', {
                heading: 'Tracking Page',
                searchedData: docs
            })
        }
    })

})

app.post('/', (req, res) => {
    const countryData = req.body.country
    const codeSplit = countryData.split(' ')
    country = codeSplit[0]

    console.log()
    const searchList = Search({
        searchedItem: countryData,
        updated: Date.now()

    })
    searchList.save()
    res.redirect('/')
})

app.listen(port, () => console.log(`Listening on port ${port}`))