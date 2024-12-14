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


const LoginBox = styled.div`
  max-width: 80%;
  margin: auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const LoginButton = styled.button`
  width: 40%;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #218838;
    transform: translateY(-2px);
  }
`;

const EditButton = styled.button`
  background-color: #ffcc33;
  color: #2c2c2c;  
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  margin-top: 5%;
  margin-right: 5%;
  width: 30%;

  &:hover {
    background-color: #2c2c2c;
  color: #ffcc33;
  }
`;


const AgencyListItem = styled.li`
  display: flex;
  justify-content: space-between;
  text-align: left;
  align-items: flex-start;  
  background-color: #eee;
  padding: 12px;
  margin: auto;
  margin-bottom: 5%;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 70%;
  transition: all 0.3s ease;

   &:hover {
    background-color: #1111;
    transform: translateY(-2px);
  }
`;

const AgencyName = styled.span`
  font-weight: bold;
  font-size: 25px;
  color: grey;
  display: block;  
`;

const AgencyContact = styled.span`
  color: grey;
  display: block;  
  margin-top: 5px;  
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
    content: '🏢';
    font-size: 24px;
  }
`;

const DescriptionText = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 30px;
  margin-bottom: 50px;
`;

const AgencyList = styled.ul`
  list-style-type: none;
  margin: auto;
`;

const AgencyRegistration = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState([]);
  const [agencyName, setAgencyName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editingAgency, setEditingAgency] = useState(null);

  const contractAddress = CONTRACT_ADDRESS; // Replace with actual deployed contract address

  // Get contract instance
  const getContractInstance = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, MyDentityContract.abi, signer);
      return contract;
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  // Fetch list of agencies
  const fetchAgencies = async () => {
    const contract = await getContractInstance();
    try {
      const agencyCount = await contract.getAgencyCount();
      const agenciesList = [];
      for (let i = 1; i <= agencyCount; i++) {
        const agency = await contract.getAgency(i);
        agenciesList.push({
          id: i,
          name: agency[1],  // Assuming the first element is the name
          contact: agency[2],  // Assuming the second element is the contact info
        });
      }
      setAgencies(agenciesList);
    } catch (error) {
      console.error("Error fetching agencies:", error);
    }
  };

  // Edit agency details
  const editAgency = async (agencyId) => {
    setEditingAgency(agencyId);
    // You can load the agency data for editing purposes here
  };

  // Update agency credentials
  const updateAgency = async () => {
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
      const tx = await contract.updateAgencyCredentials(editingAgency, agencyName, contact, passwordHash, { gasLimit: ethers.utils.hexlify(500000) });
      await tx.wait();
      alert('Agency credentials updated successfully!');
      fetchAgencies();  // Refresh agency list
      setAgencyName('');
      setContact('');
      setPassword('');
      setConfirmPassword('');
      setEditingAgency(null);
    } catch (error) {
      console.error('Error during update:', error);
      alert(`Update failed: ${error.message}`);
    }
  };

  // Initial fetch of agencies when the component mounts
  useEffect(() => {
    fetchAgencies();
  }, []);


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
          <DescriptionTitle>Agency Management Dashboard</DescriptionTitle>
          <DescriptionText>
            Manage all registered agencies in the MyDentity system. Here you can view agency details, 
            edit their information, and register new agencies. Each agency listed has unique credentials 
            and access levels. Use the edit function to modify agency details or add new agencies to 
            expand the network of authorized data handlers.
          </DescriptionText>
          
          <AgencyList>
            {agencies.map((agency, index) => (
              <AgencyListItem key={index}>
                <div>
                  <AgencyName>{agency.name}</AgencyName>
                  <AgencyContact>Contact: {agency.contact}</AgencyContact>
                  <AgencyContact>ID: {agency.id}</AgencyContact>
                </div>
                <EditButton onClick={() => navigate('/admin-agencies-edit', { state: { agency } })}>Edit</EditButton>
              </AgencyListItem>
            ))}
          </AgencyList><br /><br />
          <LoginButton onClick={() => navigate('/admin-agencies-register')}>Add Agencies</LoginButton>
        </LoginBox>
        
      </MainContent>
    </Container>
  );
};

export default AgencyRegistration;
