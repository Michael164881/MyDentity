import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MyDentityLogo from '../assets/MyDentityLogo.png';
import { ethers } from "ethers";
import MyDentityContract from '../contracts/MyDentity.json';
import { CONTRACT_ADDRESS } from '../contracts/contract.js';

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

const Sidebar = styled.div`
  width: 250px;
  background-color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.img`
  width: 150px;
  margin-bottom: 30px;
`;

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
  margin-left: 20px; /* Add space from the UserInfo */

  &:hover {
    background-color: #c82333;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 20px;
`;

const Card = styled.div`
  background: white;
  padding: 0 50px 50px 50px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 50vw;

  h3 {
    margin: 0 0 15px 0;
    color: #333;
  }
`;

const UserInfo = styled.div`
  text-align: left;
  flex: 1;
  padding-left: 20px;

  h3 {
    margin: 0;
    font-size: 24px;
    color: #2c2c2c;
    font-weight: 600;
    margin-bottom: 8px;
    
    span {
      color: #ffcc33;
      font-weight: 700;
    }
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
  }
`;

const AccessTitle = styled.div`
  text-align: center;
  margin-bottom: 10%;

  h2 {
    color: #2c2c2c;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 30px;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 3px;
      background: #ffcc33;
      border-radius: 2px;
    }
  }

  p {
    color: #666;
    font-size: 16px;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }
`;

const AgencyRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1111;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
`;

const AgencyName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2c2c2c;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '🏢';
    font-size: 20px;
  }
`;


const CardContent = styled.div`
  max-width: 100%;
  margin: auto;
`;

const CardTitle = styled.h3`
  color: #ffcc33;
  margin-bottom: 20px;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 70%;
  background-color: #f8f9fa;
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
`;

const StatusButton = styled.button`
  padding: 10px 20px;
  border: none;
  width: 200px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  background-color: ${(props) =>
    props.active
      ? props.type === 'granted'
        ? '#28a745'
        : '#dc3545'
      : '#e9ecef'};
  color: ${(props) => (props.active ? 'white' : '#666')};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AccessLabel = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #555;
  flex: 1;
  width: 100px;
`;

const ManageAccess = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [userInfo, setUserInfo] = useState({
    fullName: '',
    ic: '',
  });

  useEffect(() => {
    const fetchAgencyData = async () => {
    const userIC = localStorage.getItem('userIC');
    const userFullName = localStorage.getItem('userFullName');

    if (!userIC) {
      navigate('/'); // Redirect to login if not logged in
    } else {
      setUserInfo({
        ic: userIC,
        fullName: userFullName,
      });
    }

      try {
        if (!window.ethereum) {
            throw new Error("Please install MetaMask!");
        }
    
        await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
    
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            MyDentityContract.abi,
            signer
        );

        // Call the smart contract to fetch agencies and permissions
        const [agencyData, agencyPermissions] = await contract.getUserPermissions(userIC);
        
        setAgencies(agencyData);
        setPermissions(agencyPermissions);
      } catch (error) {
        console.error('Error fetching agency data:', error);
      }
    };

    fetchAgencyData();
  }, [navigate]);


    const handleAccessChange = async (index, accessType, agencyid) => {
      try{
        if (!window.ethereum) {
            throw new Error("Please install MetaMask!");
        }
    
        await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
    
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            MyDentityContract.abi,
            signer
        );

        const userIC = localStorage.getItem('userIC');
        const agencyID = agencyid;
        //const agencyID = agency.id; // Assuming `id` corresponds to `_agencyID`
        const newPermission = accessType === 'granted'; // Convert 'granted'/'denied' to true/false
        console.log("Information: ", agencyID, newPermission)

        // Update permission on the blockchain
        await contract.setUserPermissions(userIC, agencyID, newPermission);
  
        // Update the local state
        setPermissions((prevPermissions) => {
        const updatedPermissions = [...prevPermissions];
        updatedPermissions[index] = newPermission; // Reflect the granted/denied permission
        alert('Permission updated successfully!');
        return updatedPermissions;
        });
      } catch (error) {
        console.error('Error updating permission:', error);
      }
    };

  return (
    <Container>
      <Sidebar>
        <Logo src={MyDentityLogo} alt="MyDentity Logo" />
        <MenuSection>
        <MenuItem onClick={() => navigate('/main-menu')}>
            📊 MANAGE DATA
          </MenuItem>
          <MenuItem active onClick={() => navigate('/ManageAccess')}>
            🔒 MANAGE ACCESS
          </MenuItem>
          <MenuItem onClick={() => navigate('/DataVersions')}>
            💾 DATA VERSIONS
          </MenuItem>
        </MenuSection>
      </Sidebar>

      <MainContent>
        <Header>
          <UserInfo>
            <h3>Welcome, <span>{userInfo.fullName}</span></h3>
            <p>{userInfo.ic}</p>
          </UserInfo>
          <LogoutButton onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>
            LOG OUT
          </LogoutButton>
        </Header>

        <GridContainer>
          <Card>
          <AccessTitle>
            <h2>Agency Access Management</h2>
            <p>
              Control which agencies can access your personal information. Toggle access permissions 
              by clicking the buttons below. Granting access allows agencies to view your 
              data, while denying access restricts their ability to interact with your information. 
              You can modify these permissions at any time.
            </p>
          </AccessTitle>

            <CardContent>
              <CardTitle>Manage Agency Access</CardTitle>
              {agencies.map((agency, index) => (
                <AgencyRow key={agency.id}>
                  <AgencyName>{agency.name}</AgencyName>
                  <ButtonGroup>
                  <AccessLabel>Access Status</AccessLabel>
                    <StatusButton
                      type="granted"
                      active={permissions[index] === true}
                      onClick={() => handleAccessChange(index, 'granted', index+1)}
                    >
                      Granted
                    </StatusButton>
                    <StatusButton
                      type="denied"
                      active={permissions[index] === false}
                      onClick={() => handleAccessChange(index, 'denied', index+1)}
                    >
                      Denied
                    </StatusButton>
                  </ButtonGroup>
                </AgencyRow>
              ))}
            </CardContent>
          </Card>
        </GridContainer>
      </MainContent>
    </Container>
  );
};

export default ManageAccess; 