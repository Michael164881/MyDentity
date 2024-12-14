import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import MyDentityLogo from '../../assets/MyDentityLogo.png';
import { ethers } from 'ethers';
import MyDentityContract from '../../contracts/MyDentity.json';
import { CONTRACT_ADDRESS } from '../../contracts/contract.js';

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 80vh;
  min-width: 70vw;
  background-color: #f8f9fa;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

// Sidebar styling
const Sidebar = styled.div`
  width: 250px;
  background-color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

// Logo styling
const Logo = styled.img`
  width: 150px;
  margin-bottom: 30px;
`;

// Menu section styling
const MenuSection = styled.div`
  margin-bottom: 20px;
`;

const MenuItem = styled.div`
  display: flex;
  padding: 14px;
  cursor: pointer;
  color: ${props => (props.active ? '#ffcc33' : 'black')};
  background-color: ${props => (props.active ? 'rgba(255, 204, 51, 0.2)' : 'transparent')};
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 204, 51, 0.2);
    color: #ffcc33;
    transform: translateX(5px);
  }
`;

const MainContent = styled.div`
  flex: 1;
  background-color: #f5f5f5;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  background: white;
  padding: 25px;
  padding-left: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const LogoutButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-left: auto; 

  &:hover {
    background-color: #c82333;
    
`;

const UserInfo = styled.div`
  text-align: left;
  flex: 1;
  padding-left: 20px;

  h3 {
    margin: 0;
    font-size: 24px;
    color: #2c2c2c;
    font-weight: bold;
    margin-bottom: 8px;
    
    span {
      color: #ffcc33;
      font-weight: 700;
    }
  }
`;

const InputFieldContainer = styled.div`
  position: relative;
  width: 100%;
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
`;

const EyeIcon = styled.span`
  position: absolute;
  top: 50%;
  right: 40px;
  transform: translateY(-50%);
  cursor: pointer;
`;

const LoginBox = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 50%;
  text-align: center;
  margin: auto;
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

const SelectField = styled.select`
  width: 90%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  letter-spacing: 2px;
  background-color: #d9d1d0;
  color: grey;
  text-align: center;
  cursor: pointer;
`;

const DescriptionTitle = styled.h2`
  color: #2c2c2c;
  font-size: 20px;
  font-weight: 600;
  margin: auto;
  padding: 10px;
  align-items: center;
  gap: 10px;
  border-bottom: 3px solid #ffcc33;
  width: 45%;

  &::before {
    content: '✍️';
    font-size: 24px;
  }
`;


const MainMenu = () => {
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('userRole') === 'Admin';
    if (!isAdminLoggedIn) {
      navigate('/'); // Redirect to login if not authenticated
    }
  }, [navigate]);

  // Prevent browser back navigation
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, []);

  //show and hide password
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  //variable declaration
  const [fullName, setFullName] = useState('');
  const [ic, setIc] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const registerUser = async () => {
    // Input validation
    if (!fullName || !ic || !gender || !dob || !password) {
        alert("Please fill in all fields!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        // Check MetaMask
        if (typeof window.ethereum === "undefined") {
            throw new Error("MetaMask is not installed!");
        }

        // Request account access
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });
        const userAddress = accounts[0];

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Contract setup
        const contractAddress = CONTRACT_ADDRESS;
        const contract = new ethers.Contract(
            contractAddress,
            MyDentityContract.abi,
            signer
        );

        // Only check if IC is already registered
        try {
            const existingAddress = await contract.icToAddress(ic);
            if (existingAddress !== "0x0000000000000000000000000000000000000000") {
                alert("This IC is already registered. Please use a different IC.");
                return;
            }
        } catch (error) {
            console.log("Error checking IC status:", error);
        }

        // Hash password
        const passwordHash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(password)
        );

        const baseYear = 1900;
        const baseYearTimestamp = Math.floor(new Date(`${baseYear}-01-01T00:00:00Z`).getTime() / 1000);

        // Convert date to timestamp
        const CaldobTimestamp = Math.floor(new Date(dob).getTime() / 1000);
        const dobTimestamp = CaldobTimestamp - baseYearTimestamp;

        console.log("Registering with data:", {
            address: userAddress,
            fullName,
            gender,
            ic,
            dob: dobTimestamp,
            role: "User"
        });

        // Send transaction
        const tx = await contract.registerUser(
            userAddress,
            ic,
            "User",
            {
                gasLimit: ethers.utils.hexlify(500000)
            }
        );

        const txUserData = await contract.storeUserDataRegister(
            ic,
            // Personal Data
            fullName,
            gender,
            dobTimestamp,
            //User Account
            passwordHash,
            // Address
            '',
            '',
            '',
            '',
            // Education (updated values)
            '',
            0,
            '',
            // Household
            0,
            0,
            0,
            // Income
            '',
            '',
            0,
            '',
            // Occupation
            '',
            '',
            0,
            // Commitment
            '',
            '',
            0,
            // Relief
            '',
            '',
            0,
            //Agency
            '',
            // Add gas configuration as the last parameter
            {
                gasLimit: ethers.utils.hexlify(1000000) // Set a reasonable gas limit
            }
          );
  
        
        console.log("Transaction sent:", tx.hash);
        console.log("Transaction sent:", txUserData);
        console.log("Transaction sent:", tx);
        await tx.wait();
        await txUserData.wait();
        
        // Store IC in localStorage
        localStorage.setItem('userIC', ic);
        
        alert("Registration successful!");
        navigate('/admin-dashboard');

    } catch (error) {
        console.error("Detailed error:", error);
        
        let errorMessage = "Registration failed: ";
        if (error.message.includes("IC already registered")) {
            errorMessage += "This IC is already registered. Please use a different IC.";
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
  };

  return (
    <Container>
      <Sidebar>
        <Logo src={MyDentityLogo} alt="MyDentity Logo" />
        <MenuSection>
          <MenuItem onClick={() => navigate('/admin-dashboard')}>
            📊 DASHBOARD
          </MenuItem>
          <MenuItem active onClick={() => navigate('/admin-citizens')}>
          ✍️ CITIZENS
          </MenuItem>
          <MenuItem onClick={() => navigate('/admin-agencies')}>
          📝 AGENCIES
          </MenuItem>
          <MenuItem onClick={() => navigate('/admin-bulkData')}>
          📂 BULK DATA
          </MenuItem>
        </MenuSection>
      </Sidebar>

      <MainContent>
        <Header>
          <UserInfo>
            <h3>Welcome, <span>Admin</span></h3>
          </UserInfo>
          <LogoutButton onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>
            LOG OUT
          </LogoutButton>
        </Header>

        <LoginBox>
        <DescriptionTitle>REGISTER CITIZEN</DescriptionTitle><br/><br/>
        
        <InputField 
            type="text" 
            placeholder="Full Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)} 
            required 
        />
        
        <InputField 
            type="text" 
            placeholder="IC" 
            value={ic}
            onChange={(e) => setIc(e.target.value)} 
            required 
        />
        
        <div id="reg-input">
            <SelectField 
                value={gender}
                onChange={(e) => setGender(e.target.value)} 
                required 
            >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </SelectField>
            
            <InputField 
                type="date" 
                placeholder="D.O.B" 
                value={dob}
                onChange={(e) => setDob(e.target.value)} 
                required 
            />
        </div>
        
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
        
        <InputFieldContainer>
            <InputField
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            <EyeIcon onClick={togglePasswordVisibility}>
                {showPassword ? "🙈" : "👁️"}
            </EyeIcon>
        </InputFieldContainer>

        <LoginButton onClick={registerUser}>REGISTER</LoginButton>

        <h2>@ MYDENTITY 2024</h2>
    </LoginBox>
      </MainContent>
    </Container>
  );
};

export default MainMenu; 