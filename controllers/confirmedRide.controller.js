const {
    getFirestore,
    collection,
    addDoc,
    query,
    getDocs,
    where,
    getDoc,
    documentId,
    doc,
  } = require("firebase/firestore");
  const {
    ShiftCollection,
    DriverCollection,
    ConfirmedRideCollection,
   
  } = require("../firestore/collection");
  const { get } = require("../utils/emailSender.util");
  const confirmService = require('../service/confirmRide.service')
exports.createConfirmedRide= async (req,res,next)=>{
    try {
        const confirmData = req.body;
        // driverData.user= await handleGetUserById(req.body.userId)
        await addDoc(ConfirmedRideCollection, confirmData);
        res.status(201).json({ message: "ConfirmedRide added" });
      } catch (error) {
        throw new Error("Bad request");
      }
}
exports.findConfirmedRide= async (req,res,next)=>{
    try {
        const confirmData = req.body;
        // driverData.user= await handleGetUserById(req.body.userId)
        await addDoc(ConfirmedRideCollection, confirmData);
        res.status(201).json({ message: "ConfirmedRide added" });
      } catch (error) {
        throw new Error("Bad request");
      }
}