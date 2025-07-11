import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main/Index";
import Signup from "./components/Singup";
import Login from "./components/Login";
import { AuthProvider } from "./context/AuthContext";
import ModeratorDash from "./components/Moderator/ModeratorDash.jsx";
import EmployeeDashboard from "./components/Employee/EmployeeDashboard.jsx";

function App() {
	const user = localStorage.getItem("token");

	return (
		<AuthProvider>
		<Routes>
			<Route path="/moderatorDash" element={<ModeratorDash />} />
			<Route path="/employeeDash" element={<EmployeeDashboard />} />


			{/* {user && <Route path="/" exact element={<Main />} />} */}
			<Route path="/signup" exact element={<Signup />} />
			<Route path="/" exact element={<Login />} />
			{/* <Route path="/" element={<Navigate replace to="/login" />} /> */}
		</Routes>
		</AuthProvider>

	);
}

export default App;
