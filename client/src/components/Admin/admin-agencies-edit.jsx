import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const LoginBox = styled.div`
  max-width: 400px;
  margin: auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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
`;

const Title = styled.h1`
  font-size: 30px;
  margin-bottom: 30px;
`;


const AgencyEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const agency = location.state?.agency || {}; // Agency data passed via state
  const contractAddress = CONTRACT_ADDRESS;

  const [agencyName, setAgencyName] = useState(agency.name || '');
  const [contact, setContact] = useState(agency.contact || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getContractInstance = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, MyDentityContract.abi, signer);
      return contract;
    } else {
      alert('Please install MetaMask to use this feature.');
    }
  };

  const saveChanges = async () => {
    if (!agencyName || !contact || !password) {
      alert('Please fill in all fields!');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const contract = await getContractInstance();
      const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(password));
      const tx = await contract.updateAgency(
        agency.id,
        agencyName,
        contact,
        passwordHash,
        { gasLimit: ethers.utils.hexlify(500000) }
      );
      await tx.wait();
      alert('Agency updated successfully!');
      navigate('/admin-agencies'); // Redirect back to the agencies list
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Failed to save changes: ${error.message}`);
    }
  };


  return (
    <Container>
      <Sidebar>
        <Logo src={MyDentityLogo} alt="MyDentity Logo" />
        <MenuSection>
          <MenuItem  onClick={() => navigate('/admin-dashboard')}>
            📊 DASHBOARD
          </MenuItem>
          <MenuItem onClick={() => navigate('/admin-citizens')}>
          ✍️ CITIZENS
          </MenuItem>
          <MenuItem active onClick={() => navigate('/admin-agencies')}>
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
          <LogoutButton
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
          >
            Log Out
          </LogoutButton>
        </Header>

        <LoginBox>
            <Title>Edit {agencyName}</Title>
            <InputField
                type="text"
                placeholder="Agency Name"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
            />
            <InputField
                type="text"
                placeholder="Contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
            />
            <InputField
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <InputField
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <LoginButton onClick={saveChanges}>Save Changes</LoginButton>
        </LoginBox>
        
      </MainContent>
    </Container>
  );
};

export default AgencyEdit;
