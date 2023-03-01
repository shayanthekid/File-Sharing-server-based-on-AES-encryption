const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.set('view engine', 'ejs');


// Connect to the MongoDB database
mongoose.connect(
    "mongodb+srv://Sudeysh:NC5tYtm2zDzvZkm5@flle-sharing.bn4jz1i.mongodb.net/?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB", err);
});

// Set up routes
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});