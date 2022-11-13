import app from './app.js'

async function main() {
    app.listen(7301)

    process.send?.('ready')

    console.log('App listening on http://localhost:7301')
}
void main()
