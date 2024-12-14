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

const DataVersion = styled.div`
  color: #ff7f50;
  padding: 8px 15px;
  border-radius: 5px;
  border: 1px solid #ff7f50;
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
  gap: 20px;
  margin-bottom: 20px;
`;

const Card = styled.div`
  background: white;
  padding: 50px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;

  h3 {
    margin: 0 0 15px 0;
    color: #333;
  }
`;

const ManageButton = styled.button`
  background-color: #ffcc33;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;

  &:hover {
    background-color: #e6b800;
  }
`;

const VersionSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const VersionList = styled.ul`
  list-style-type: none;
  padding: 0;
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

const DisclaimerSection = styled.div`
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 30px;
  border-radius: 15px;
  margin-top: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  margin: auto;
  width: 93%;
  transition: all 1s ease;
`;

const DisclaimerContent = styled.div`
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: all 1s ease;

  ${DisclaimerSection}:hover & {
    opacity: 1;
    height: auto;
    margin-top: 20px;
  }
`;

const HoverLabel = styled.div`
  text-align: center;
  color: #666;
  font-size: 16px;
  font-weight: 600;
  padding: 10px;
  
  ${DisclaimerSection}:hover & {
    opacity: 0;
    height: 0;
    margin: 0;
    padding: 0;
    transition: all 1s ease;
  }

  &::before {
    content: '👆';
    margin-right: 8px;
  }
`;

const DisclaimerTitle = styled.h3`
  color: #2c2c2c;
  font-size: 25px;
  font-weight: 600;
  margin-bottom: 25px;
  font-weight: bold;

  &::before {
    content: '🔒';
    margin-right: 20px;
    font-size: 24px;
  }
`;

const DisclaimerText = styled.p`
  color: #666;
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 35px;
  font-weight: bold;
`;

const DisclaimerPoints = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 10px;
    padding-left: 25px;
    position: relative;

    &::before {
      content: '•';
      color: #ffcc33;
      font-size: 20px;
      position: absolute;
      left: 8px;
      top: -2px;
    }
  }
`;

const MainMenu = () => {
  const navigate = useNavigate();
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    ic: '',
  });

  // Check if user is logged in
  useEffect(() => {
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
  }, [navigate]);

  // Navigation pages
  const pages = {
    'PERSONAL DATA': '/personal-data',
    'ADDRESS': '/address',
    'EDUCATION': '/education',
    'HOUSEHOLD': '/household',
    'OCCUPATION': '/occupation',
    'INCOME': '/income',
    'COMMITMENT': '/commitment',
    'RELIEF': '/relief',
    'USER ACCOUNT': '/user-account'
  };

  //DISPLAY VERSION
  const [versions, setVersions] = useState([]);
  const userIC = localStorage.getItem('userIC');

  const fetchVersions = async () => {
      if (!userIC) {
          alert("Please provide the User IC");
          return;
      }

      try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          const contract = new ethers.Contract(
            CONTRACT_ADDRESS, 
            MyDentityContract.abi, 
            signer
          );

          const versions = await contract.getUserDataVersions(userIC);
          setVersions(versions.map((v) => v.toNumber())); // Convert BigNumber to plain number
      } catch (error) {
          console.error("Error fetching versions:", error);
          alert("Failed to fetch user data versions.");
      }
  };

  // Fetch versions on component mount
  useEffect(() => {
    fetchVersions();
  }, []);


  return (
    <Container>
      <Sidebar>
        <Logo src={MyDentityLogo} alt="MyDentity Logo" />
        <MenuSection>
          <MenuItem active onClick={() => navigate('/main-menu')}>
            📊 MANAGE DATA
          </MenuItem>
          <MenuItem onClick={() => navigate('/ManageAccess')}>
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
          {Object.entries(pages).map(([title, path]) => (
            <Card key={title}>
              <h3>{title}</h3>
              <ManageButton onClick={() => {
                navigate(path, { 
                  state: { version: selectedVersion } 
                });
              }}>
                MANAGE
              </ManageButton>
            </Card>
          ))}
        </GridContainer>

        <DisclaimerSection>
          <HoverLabel>Hover here to view Data Privacy & Security Notice</HoverLabel>
          <DisclaimerContent>
            <DisclaimerTitle>Data Privacy & Security Notice</DisclaimerTitle>
            <DisclaimerText>
              MyDentity is committed to protecting your personal information and ensuring data security. 
              Please review the following important information about your data:
            </DisclaimerText>
            <DisclaimerPoints>
              <li>
                Your data is stored securely on the blockchain and can only be accessed by agencies 
                you explicitly grant permission to.
              </li>
              <li>
                You maintain full control over your information and can modify access permissions 
                at any time through the Manage Access section.
              </li>
              <li>
                All data updates are tracked with version history, allowing you to review changes 
                made to your information.
              </li>
              <li>
                Your personal information is encrypted and protected using industry-standard 
                security protocols.
              </li>
              <li>
                We recommend regularly reviewing your access permissions and data versions to 
                ensure information accuracy and security.
              </li>
            </DisclaimerPoints>
          </DisclaimerContent>
        </DisclaimerSection>
      </MainContent>
    </Container>
  );
};

export default MainMenu; 