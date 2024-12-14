import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MyDentityLogo from '../../assets/MyDentityLogo.png';
import MyDentityContract from '../../contracts/MyDentity.json';
import { ethers } from "ethers";
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

// Menu item styling
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

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
    font-weight: bold;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
`;

const SearchInput = styled.input`
  padding: 10px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
  background-color: #d9d1d0;
  color: grey;
  text-align: center;
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background-color: #ffcc33;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #e6b800;
  }
`;

const Message = styled.div`
  text-align: center;
  font-size: 18px;
  color: ${(props) => (props.error ? 'red' : '#333')};
`;

const UserDetails = styled.div`
  text-align: center;
  margin-top: 20px;
  background: #e9ecef;
  padding: 30px;
  width: 50%;
  margin: auto;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  p {
    font-size: 16px;
    color: #666;
    margin: 0 0 15px 0;
    line-height: 1.6;
  }

  button {
    background: #ffcc33;
    color: #2c2c2c;
    border: none;
    padding: 12px 25px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;

    &:hover {
      background: #ffd966;
      transform: translateY(-2px);
    }
  }
`;

const ContentContainer = styled.div`
  background: white;
  padding-bottom: 50px;
  min-height: 40vh;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  margin-top: 2%;
`;

const Title = styled.h3`
  color: grey;
  font-size: 25px;
`;

const ViewUserDataTitle = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h2 {
    color: #2c2c2c;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 40px;
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

const AgencyDashboard = () => {
  const navigate = useNavigate();
  const [searchIC, setSearchIC] = useState('');
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const agencyID = localStorage.getItem("ID");

  const [userInfo, setUserInfo] = useState({
    ID: localStorage.getItem("ID") || "",
    agencyName: localStorage.getItem("agencyName") || "",
    agencyContact: localStorage.getItem("agencyContact") || "",
  });

  const handleSearch = async () => {
    if (!searchIC) {
      setMessage('Please enter a valid IC.');
      return;
    }

    try {
      // Connect to Ethereum provider
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

      // Fetch user permissions
      const [agencies, permissions] = await contract.getUserPermissions(searchIC);

      console.log("Permissions:", permissions);
      console.log("Agency ID:", agencyID);
      console.log("IC", searchIC)
      // Check agency permission
      if (!permissions[agencyID - 1]) {
        setMessage('Access to user data denied.');
        setUserData(null);
        return;
      }

      // Fetch user data
      const user = await contract.getCurrentUserData(searchIC);
      console.log("User Info", user);
      setUserData(user);
      setMessage('');
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage('User not found or an error occurred.');
      setUserData(null);
    }
  };


  return (
    <Container>
      <Sidebar>
        <Logo src={MyDentityLogo} alt="MyDentity Logo" />
        <MenuSection>
          <MenuItem active onClick={() => navigate('/agency-dashboard')}>
            ✍️ CITIZEN DATA
          </MenuItem>
          <MenuItem onClick={() => navigate('/agency-bulkData')}>
            📂 BULK DATA
          </MenuItem>
        </MenuSection>
      </Sidebar>

      <MainContent>
        <Header>
          <UserInfo>
            <h3>Welcome, <span>{userInfo.agencyName}</span></h3>
            <p>Agency ID: {userInfo.ID}</p>
          </UserInfo>
          <LogoutButton onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>
            LOG OUT
          </LogoutButton>
        </Header>

        <ContentContainer>
          <ViewUserDataTitle>
            <h2>View User Data</h2>
            <p>
            Access citizen data securely and efficiently. By entering the IC number, 
            authorized personnel can quickly retrieve and view essential user information. This ensures that 
            data access is restricted to authorized users, providing a seamless and secure way to manage and 
            verify citizen records while holding the highest standards of confidentiality and transparency.
            </p>
          </ViewUserDataTitle>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Enter User IC"
              value={searchIC}
              onChange={(e) => setSearchIC(e.target.value)}
            />
            <SearchButton onClick={handleSearch}>Search</SearchButton>
          </SearchContainer>

          {message && <Message error={message.includes('denied') || message.includes('not found')}>{message}</Message>}

          {userData && (
            <UserDetails>
              <p><b>Name:</b> {userData.fullName}</p>
              <p><b>Address:</b> {userData.homeAddress}</p>
              <p><b>State:</b> {userData.state}</p>
              <p><b>City:</b> {userData.city}</p>
              <button onClick={() => navigate('/agency-userDetail', { state: { userData } })}>View More</button>
            </UserDetails>
          )}
        </ContentContainer>
      </MainContent>
    </Container>
  );
};

export default AgencyDashboard; 