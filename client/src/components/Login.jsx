import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethers } from "ethers";
import styled from "styled-components";
import MyDentityContract from '../contracts/MyDentity.json';
import MyDentityLogo from '../assets/MyDentityLogo.png';
import { CONTRACT_ADDRESS } from '../contracts/contract.js';

const LoginBox = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 350px;
  text-align: center;
`;

const Logo = styled.img`
  width: 300px;
`;

const Title = styled.h1`
  font-size: 18px;
  margin-bottom: 30px;
`;

const InputFieldContainer = styled.div`
  position: relative;
  width: 100%;
`;

const InputField = styled.input`
  width: 80%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  letter-spacing: 2px;
  background-color: #d9d1d0;
  color: grey;
  padding-right: 50px;
  text-align: center;
`;

const LoginButton = styled.button`
  width: 100%;
  background-color: #ffcc33;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s ease-in-out;

  &:hover{
    transform: translateY(-10%);
  }
`;

const RegisterLink = styled(Link)`  
  display: block;
  margin-top: 15px;
  color: #007bff;
  cursor: pointer;
  text-decoration: none;
  width: 50%;
`;

const EyeIcon = styled.span`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
`;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
  
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
    const loginUser = async () => {
      // Input validation
      if (!username || !password) {
        alert("Please fill in all fields!");
        return;
      }
  
      setIsLoading(true);
  
      try {
        console.log("Starting login process...");
  
        // Check MetaMask
        if (typeof window.ethereum === "undefined") {
          throw new Error("MetaMask is not installed!");
        }
        console.log("MetaMask is installed");
  
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const userAddress = accounts[0];
        console.log("Connected account:", userAddress);
  
        // Initialize provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log("Signer obtained");
  
        // Contract setup
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyDentityContract.abi,
          signer
        );
  
        // Check if input matches admin credentials
        const adminCredentials = await contract.loginAdmin(username, password);
        if (adminCredentials[0]) {
          console.log(adminCredentials[1]); // Success message
          localStorage.setItem("userRole", "Admin");
          navigate("/admin-dashboard");
          return;
        }

        //Hash Password
        const passwordHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(password)
        );
  
        // Check if input matches agency credentials
        const isAgency = await contract.isAgency(parseInt(username));
        console.log("Is it Agency?", isAgency);
        if (isAgency) {
          console.log("Agency Credentials?", username, passwordHash);
          const agencyCredentials = await contract.loginAgency(parseInt(username), passwordHash);
          console.log("Agency Credentials?", agencyCredentials);
          if (agencyCredentials[0]) {
            console.log("Agency login successful");
            // Fetch agency details
            const agencyDetails = await contract.getAgency(parseInt(username)); // Assuming this method returns [name, contact]
            const [agencyID, agencyName, agencyContact] = agencyDetails;

            // Store agency details in localStorage
            localStorage.setItem("userRole", "Agency");
            localStorage.setItem("ID", username);
            localStorage.setItem("agencyName", agencyName);
            localStorage.setItem("agencyContact", agencyContact);
            navigate("/agency-dashboard");
            return;
          }
        }
  
        // Default to User login
        const [fullName, role] = await contract.loginUser(username, passwordHash);
  
        console.log("User login successful");
        localStorage.setItem('userIC', username);
        localStorage.setItem("userFullName", fullName);
        localStorage.setItem("userRole", role);
        navigate("/main-menu");
  
      } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please check your credentials.", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <LoginBox>
        <Logo src={MyDentityLogo} alt="MyDentity Logo" />
        <InputField 
          type="text" 
          placeholder="IC" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <InputFieldContainer>
          <InputField
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <EyeIcon onClick={togglePasswordVisibility}>
            {showPassword ? "🙈" : "👁️"}
          </EyeIcon>
        </InputFieldContainer>
        <LoginButton 
          onClick={loginUser}
          disabled={isLoading}
        >
          {isLoading ? "LOGGING IN..." : "LOGIN"}
        </LoginButton>
        <center><RegisterLink to="/register">Register As New User</RegisterLink></center>
        <h2>@ MYDENTITY 2024</h2>
      </LoginBox>
    );
  };

export default Login; 