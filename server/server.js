const mongoose = require('mongoose');
const Document = require('./Document')

mongoose.connect("mongodb://localhost/google-docs-clone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
//   useFindAndModify: false,
//   useCreateIndex: true,
})

const defaultValue = "";

const io = require('socket.io')(3001,{
    cors: {
        origin: 'http://localhost:3000',
        methods:['GET','POST']
    }
})

io.on("connection",socket => {

    socket.on('get-doc',async docId=>{
        const doc = await findOrCreateDoc(docId)
        socket.join(docId)
        socket.emit("load-doc",doc.data)

        socket.on('send-changes',delta => {
            socket.broadcast.to(docId).emit("receive-changes",delta);
        })

        socket.on('save-doc',async data =>{
            await Document.findByIdAndUpdate(docId,{data})
        })
    })

})

async function findOrCreateDoc(id){
    if(id == null) return;
    const doc = await Document.findById(id);
    if(doc){
        return doc;
    }
    return await Document.create({_id:id,data:defaultValue});
}