const notFound = (req,res)=>{
    return res.status(404).send("Not found 404")
}
module.exports = notFound