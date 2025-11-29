// import React from 'react'
// import { Container } from 'react-bootstrap'
// import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomeScreen from './screens/HomeScreen'
import ProductScreen from './screens/ProductScreen'
import CartScreen from './screens/CartScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import ProtectedRoute from './components/ProtectedRoute'

// function App() {
//   return (
//     <>
//       <Header />
//       <main className="py-3">
//         <Container>
//           <Routes>
//             <Route path="/" element={<HomeScreen />} />
//             <Route path="/product/:id" element={<ProductScreen />} />
//             <Route path="/cart" element={<CartScreen />} />
//             <Route path="/login" element={<LoginScreen />} />
//             <Route path="/register" element={<RegisterScreen />} />
//             {/* example protected route wrapper */}
//             <Route path="/profile" element={<ProtectedRoute><div>Profile (create screen)</div></ProtectedRoute>} />
//           </Routes>
//         </Container>
//       </main>
//       <Footer />
//     </>
//   )
// }

// export default App
import React from 'react'
import { Container } from 'react-bootstrap'
// import Header from './components/Header'
// import Footer from './components/Footer'
// import HomeScreen from './screens/HomeScreen'
import { Routes, Route } from 'react-router-dom'
import PaymentSuccessScreen from './screens/PaymentSuccessScreen'
import AdminOrderList from './screens/AdminOrderList'

function App() {
  return (
   

      <div className="app-container">
      <div className="header">
        <Header />
      </div>

      <div className="main-content">
        <Routes>
             <Route path="/" element={<HomeScreen />} />
             <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/success" element={<PaymentSuccessScreen />} />
            <Route path="/admin/orders" element={<AdminOrderList />} />
             {/* example protected route wrapper */}
             <Route path="/profile" element={<ProtectedRoute><div>Profile (create screen)</div></ProtectedRoute>} />
           </Routes>
      </div>

      <div className="footer">
        <Footer />
      </div>
    </div>
  )
}

export default App
