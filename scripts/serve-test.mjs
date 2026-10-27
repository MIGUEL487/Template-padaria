import {createServer} from 'node:http'
import sirv from 'sirv'
// Serve production output with byte ranges, as Vercel does for MP4 seeking.
createServer(sirv('.output/public',{single:true})).listen(Number(process.env.TEST_PORT||8783),'127.0.0.1')
