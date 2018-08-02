
import Server from './'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))

const server = new Server({
  'workspace': argv.workspace,
  'port': argv.port
})

server.start()
