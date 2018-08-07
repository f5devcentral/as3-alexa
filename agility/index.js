const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();


app.use(express.static(path.join(__dirname, '/client'))); // set the static files location /public/img will be /img for users
app.use(express.static(path.join(__dirname, '../app')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname + 'index.html'));
});



app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});