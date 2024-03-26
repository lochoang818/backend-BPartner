const {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
} = require("firebase/firestore/lite");
const { DriverCollection } = require("../firestore/collection");
require("express-async-errors"); // Import thư viện express-async-errors
const createDriver = async (req, res, next) => {
    try {
        const userData = req.body;
        // console.log("User Data:", userData);

        // Thêm người dùng vào cơ sở dữ liệu Firestore
        await addDoc(DriverCollection, userData);
        res.status(201).json({ msg: "Driver added" });
    } catch (error) {
        throw new Error("Bad request");
    }
};
const findByIdUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log(userId);
        const q = query(
            DriverCollection,
            where("userId", "==", userId.toString())
        );
        const querySnapshot = await getDocs(q);

        const drivers = [];
        querySnapshot.forEach((doc) => {
            drivers.push(doc.data());
        });

        res.status(200).json(drivers);
    } catch (error) {
        next(error);
    }
};
module.exports = {
    createDriver,
    findByIdUser,
};
