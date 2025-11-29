// import Order from '../models/orderModel.js'

// // -----------------------------------------
// // CREATE ORDER
// // -----------------------------------------
// export const addOrderItems = async (req, res) => {
//   const {
//     orderItems,
//     shippingAddress,
//     paymentMethod,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//   } = req.body

//   if (!orderItems || orderItems.length === 0) {
//     return res.status(400).json({ message: 'No order items found' })
//   }

//   const order = new Order({
//     user: req.user._id,
//     orderItems,
//     shippingAddress,
//     paymentMethod,
//     itemsPrice,
//     taxPrice,
//     shippingPrice,
//     totalPrice,
//   })

//   const createdOrder = await order.save()
//   res.status(201).json(createdOrder)
// }

// // -----------------------------------------
// // ADMIN – GET ALL ORDERS
// // -----------------------------------------
// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({})
//       .populate('user', 'name email')
//       .populate('orderItems.product', 'name price image')

//     res.json(orders)
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// }

// // -----------------------------------------
// // GET ORDER BY ID
// // -----------------------------------------
// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('user', 'name email')

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' })
//     }

//     res.json(order)
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// }


import Order from '../models/orderModel.js'

// ------------------------------------------------------------------
// Create order using Stripe checkout success
// ------------------------------------------------------------------
export const createOrderFromStripe = async (req, res) => {
  try {
    const { session, cartItems } = req.body

    if (!session) {
      return res.status(400).json({ message: "Stripe session missing" })
    }

    const shipping = session.customer_details.address

    const order = new Order({
      user: req.user._id,

      orderItems: cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id
      })),

      shippingAddress: {
        address: shipping.line1 || "",
        city: shipping.city || "",
        postalCode: shipping.postal_code || "",
        country: shipping.country || "",
      },

      paymentMethod: "Stripe",
      itemsPrice: session.amount_subtotal / 100,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: session.amount_total / 100,
      isPaid: true,
      paidAt: Date.now(),
    })

    const createdOrder = await order.save()

    res.status(201).json(createdOrder)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ------------------------------------------------------------------
// Create order manually (if not using Stripe)
// ------------------------------------------------------------------
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items found' })
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  })

  const createdOrder = await order.save()
  res.status(201).json(createdOrder)
}


// ------------------------------------------------------------------
// Admin: Get all orders
// ------------------------------------------------------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image')

    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ------------------------------------------------------------------
// Get Order by ID
// ------------------------------------------------------------------
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
