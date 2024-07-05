import expressAsyncHandler from "express-async-handler";
import Product from '../models/product.models.js';
import Order from '../models/order.models.js'

//utiliti function
function calcPrices(orderItems) {
    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxRate = 0.15;
    const taxPrice = (itemsPrice * taxRate).toFixed(2);
    const totalPrice = (itemsPrice + shippingPrice + parseFloat(taxPrice)).toFixed(2);
    
    return {
      itemsPrice: itemsPrice.toFixed(2),
      shippingPrice: shippingPrice.toFixed(2),
      taxPrice,
      totalPrice,
    };
}

export const createOrder = async (req, res) => {
    try {
      const { orderItems, shippingAddress, paymentMethod } = req.body;
  
      if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error("No order items");
      }
  
      const itemsFromDB = await Product.find({
        _id: { $in: orderItems.map((x) => x._id) },
      });
  
      const dbOrderItems = orderItems.map((itemFromClient) => {
        const matchingItemFromDB = itemsFromDB.find(
          (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
        );
  
        if (!matchingItemFromDB) {
          res.status(404);
          throw new Error(`Product not found: ${itemFromClient._id}`);
        }
  
        return {
          ...itemFromClient,
          product: itemFromClient._id,
          price: matchingItemFromDB.price,
          _id: undefined,
        };
      });
  
      const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
        calcPrices(dbOrderItems);
  
      const order = new Order({
        orderItems: dbOrderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });
  
      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};


export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find({}).populate("user", "id username");
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

export const getUserOrders = expressAsyncHandler(async (req,res)=>{
    try {
        const orders = await Order.find({
            user:req.user._id
        });
        res.json(orders);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error:error.message
        })
    }
})
export const countToatlOrders = expressAsyncHandler (async(req,res)=>{
    try {
        const totalOrders =await Order.countDocuments();
        res.json({totalOrders});
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error:error.message
        })
    }
})


export const calculateTotalSales=expressAsyncHandler(async(req,res)=>{
    try {
        const orders =await Order.find()
        const totalSales = orders.reduce((sum,order)=> sum + order.totalPrice , 0)
        res.json({totalSales})
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error:error.message
        })
    }
})

export const calculateTotalSalesByDate =expressAsyncHandler(async(req,res)=>{
    try {
        const salesByDate = await Order.aggregate([
            {
              $match: {
                isPaid: true,
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
                },
                totalSales: { $sum: "$totalPrice" },
              },
            },
        ]);
        res.json(salesByDate)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error:error.message
        })
    }
})

export const findOrderById = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate(
        "user",
        "username email"
      );
  
      if (order) {
        res.json(order);
      } else {
        res.status(404);
        throw new Error("Order not found");
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};  


export const markOrderPaid =expressAsyncHandler(async(req,res)=>{
    try {
        const order =await  Order.findById(req.params.id) 
        if(order){
            order.isPaid=true;
            order.paidAt=Date.now()
            order.paymentResult ={
                id:req.body.id,
                status:req.body.status,
                update_time:req.body.update_time,
                email_address:req.body.payer.email_address
            }
            const updatedOrder =await order.save()
            res.status(200).json(updatedOrder)
        }
        else{
            return res.status(404).json({
                error:"Order not found"
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error:error.message
        })
    }
})


export const markedAsDelivered = expressAsyncHandler(async(req,res)=>{
    try {
        const order =await Order.findById(req.params.id);
        if(order){
            order.isDelivered=true;
            order.deliveredAt=Date.now()
            const updatedOrder =await order.save()
            res.status(200).json(updatedOrder)
        }
        else{
            return res.status(404).json({
                error:"Order not found"
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error:error.message
        })
    }
})