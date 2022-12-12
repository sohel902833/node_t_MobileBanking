import {createServer} from 'http'
import {app} from "./app"


const bootstrap=()=>{
    const server=createServer(app);
    server.listen(process.env.PORT,()=>{
         console.log("Server Is Running On Port "+process.env.PORT)
    })
}

bootstrap();

