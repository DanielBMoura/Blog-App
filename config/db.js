const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD

if (process.env.NODE_ENV == 'production') {
    module.exports = { mongoURI: `mongodb+srv://${dbUser}:${dbPassword}@cluster0.0lmqkhv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` }
} else {
    module.exports = { mongoURI: `mongodb://localhost/blogapp` }
}