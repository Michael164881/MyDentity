import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MyDentityLogo from '../assets/MyDentityLogo.png';
import { ethers } from "ethers";
import MyDentityContract from '../contracts/MyDentity.json';
import { CONTRACT_ADDRESS } from '../contracts/contract.js';
// Container for the entire notification component
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

// Main content styling
const MainContent = styled.div`
  flex: 1;
  background-color: #f5f5f5;
  padding: 25px;
`;

// Header styling
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

// Logout button styling
const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  }
`;

// User info styling
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

// Message styling
const Message = styled.div`
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  background-color: #2c2c2c;
  color: ${(props) => (props.error ? '#dc3545' : '#ffcc33')};
  padding: 15px;
  margin-top: 5%;
  width: 25%;
  border-radius: 0px 0px 10px 10px;
  margin: 0 auto;
`;

// Version list styling
const VersionList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin: auto;
  max-width: 1200px;
`;

const VersionItem = styled.div`
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
  border: 1px solid #eee;
  height: 80%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    width: 330%;
    height: 90%;
    z-index: 10;
  }

  &:nth-child(3n+1):hover {
    transform: translateY(-5px)translateX(-2%);
  }

  &:nth-child(3n+2):hover {
    transform: translateY(-5px) translateX(-35%);
  }

  &:nth-child(3n):hover {
    transform: translateY(-5px) translateX(-68%);
  }
`;

// Version header styling
const VersionHeader = styled.div`
  padding: 20px;
  background: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Version label styling
const VersionLabel = styled.span`
  background: #ffcc33;
  color: #333;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.5px;
  padding: 4px 15px;
  border-radius: 10px;
  margin: auto;
`;

// Details styling
const Details = styled.div`
  padding: 0;
  background: white;
  max-height: 0;
  opacity: 0;
  overflow: hidden;

  ${VersionItem}:hover & {
    padding: 20px;
    max-height: 100%;
    opacity: 1;
  }
`;

// Detail row styling
const DetailRow = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;

  &:last-child {
    border-bottom: none;
  }
`;

// Detail label styling
const DetailLabel = styled.span`
  color: #666;
  font-size: 14px;
  min-width: 100px;
`;

// Detail value styling
const DetailValue = styled.span`
  color: #2c2c2c;
  font-weight: 500;
  font-size: 14px;
`;

const Hover = styled.h4`
  color: grey;
  letter-spacing: 1px;
  padding: 0px;
  margin: 5% 0 0 0;
  font-size: 12px;
  letter-spacing: 1px;
  font-weight: 400;

  ${VersionItem}:hover & {
    opacity: 0;
  }
`;

const MainContainer = styled.div`
  background-color: white;
  padding: 0 5% 5% 5%;
  margin: 2%;
`;

// Apply button styling
const ApplyButton = styled.button`
  width: 100%;
  padding: 15px;
  background: #ffcc33;
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translateY(100%);
  opacity: 0;

  ${VersionItem}:hover & {
    transform: translateY(0);
    opacity: 1;
  }

  &:hover {
    background: #ffcc33;
    color: #2c2c2c;
  }
`;

// Add padding at the bottom of Details to accommodate the button
const DetailsWrapper = styled.div`
  padding-bottom: 60px;
`;

// Add these new styled components
const VersionTitle = styled.div`
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

const Notification = () => {
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    ic: '',
  });
  const [userIC, setUserIC] = useState(localStorage.getItem('userIC'));
  const [message, setMessage] = useState('');
  const [versionDetails, setVersionDetails] = useState({});

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

  const fetchVersions = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyDentityContract.abi,
        signer
      );
  
      // Fetch all data versions
      const dataVersions = await contract.getUserDataVersions(userIC);
      const filteredVersions = dataVersions.map((v) => v.toNumber()).filter((v) => v > 1); // Exclude version 1
  
      // Set versions state (if you still need to display versions separately)
      setVersions(filteredVersions);
  
      // Fetch data for each version immediately after
      let details = {};
      for (let version of filteredVersions) {
        const versionData = await contract.getUserDataByVersion(userIC, version);
        details[version] = versionData;
      }
  
      // Set version details after fetching all data
      setVersionDetails(details);
    } catch (error) {
      console.error('Error fetching versions:', error);
      setMessage('Failed to fetch user data versions.');
    }
  };
  

  const applyVersion = async (version) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyDentityContract.abi,
        signer
      );

      //Get current user password
      let data;
      data = await contract.getCurrentUserData(userIC);
      const passwordHash = data.passwordHash;
      console.log("Password", passwordHash);

      const transaction = await contract.setCurrentVersion(userIC, version);
      await transaction.wait();
      const currentData = await contract.getCurrentUserData(userIC);

      // Send transaction with all required parameters
      const tx = await contract.storeUserData(
        userIC,
        // Personal Data
        currentData?.fullName || '',
        currentData?.gender || '',
        currentData?.DOB || 0,
        //User Account
        passwordHash,
        // Address
        currentData?.homeAddress || '',
        currentData?.state || '',
        currentData?.city || '',
        currentData?.zipCode || '',
        // Education (updated values)
        currentData?.educationLevel || '',
        currentData?.graduationYear || 0,
        currentData?.institution || '',
        // Household
        currentData?.householdSize || 0,
        currentData?.householdIncome || 0,
        currentData?.dependents || 0,
        // Income
        currentData?.incomeSource || '',
        currentData?.incomeFrequency || '',
        currentData?.incomeAmount || 0,
        currentData?.incomeNotes || '',
        // Occupation
        currentData?.occupation || '',
        currentData?.employer || '',
        currentData?.yearsOfExperience || 0,
        // Commitment
        currentData?.commitmentType || '',
        currentData?.commitmentDetails || '',
        currentData?.commitmentAmount || 0,
        // Relief
        currentData?.reliefType || '',
        currentData?.reliefDetails || '',
        currentData?.reliefAmount || 0,
        false,
        // Agency
        '',
        // Add gas configuration as the last parameter
        {
            gasLimit: ethers.utils.hexlify(1000000) // Set a reasonable gas limit
        }
      );
      
      await tx.wait();
      
      setMessage(`Version ${version-1} has been applied.`);
    } catch (error) {
      console.error('Error applying version:', error);
      setMessage('Failed to apply version.');
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  return (
    <Container>
      <Sidebar>
        <Logo src={MyDentityLogo} alt="MyDentity Logo" />
        <MenuSection>
          <MenuItem onClick={() => navigate('/main-menu')}>
            📊 MANAGE DATA
          </MenuItem>
          <MenuItem onClick={() => navigate('/ManageAccess')}>
            🔒 MANAGE ACCESS
          </MenuItem>
          <MenuItem active onClick={() => navigate('/DataVersions')}>
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

        

      <MainContainer>
      {message && <Message>{message}</Message>}
        <VersionTitle>
          <h2>Data Version History</h2>
          <p>
            View and manage different versions of your data that have been updated by authorized agencies. 
            Each version represents a unique update to your information. Hover over any version to see the details and 
            choose which version to apply as your current data.
          </p>
        </VersionTitle>
        <VersionList>
          {versions.map((version) => (
            <VersionItem key={version}>
              <VersionHeader>
                <VersionLabel>Version {version - 1}</VersionLabel>
              </VersionHeader>
              
              {versionDetails[version] && (
                <DetailsWrapper>
                  <Details>
                    <DetailRow>
                      <DetailLabel>Full Name</DetailLabel>
                      <DetailValue>{versionDetails[version].fullName}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Gender</DetailLabel>
                      <DetailValue>{versionDetails[version].gender}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Date of Birth</DetailLabel>
                      <DetailValue>
                      {versionDetails[version].DOB ? 
                        (() => {
                          const baseYearTimestamp = Math.floor(new Date('1900-01-01T00:00:00Z').getTime() / 1000);
                          const originalTimestamp = versionDetails[version].DOB.toNumber() + baseYearTimestamp;
                          return new Date(originalTimestamp * 1000).toISOString().split('T')[0];
                        })() 
                        : "N/A"}
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Address</DetailLabel>
                      <DetailValue>{versionDetails[version].homeAddress}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>State</DetailLabel>
                      <DetailValue>
                      {versionDetails[version].state}
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>City</DetailLabel>
                      <DetailValue>
                      {versionDetails[version].city}
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Zip Code</DetailLabel>
                      <DetailValue>
                      {versionDetails[version].zipCode}
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Education Level</DetailLabel>
                      <DetailValue>{versionDetails[version].educationLevel}</DetailValue>
                    </DetailRow>  
                    <DetailRow>
                      <DetailLabel>Graduation Year</DetailLabel>
                      <DetailValue>{versionDetails[version].graduationYear ? ethers.BigNumber.from(versionDetails[version].graduationYear).toNumber() : "N/A"}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Institution</DetailLabel>
                      <DetailValue>{versionDetails[version].institution}</DetailValue>
                    </DetailRow>  
                    <DetailRow>
                      <DetailLabel>Household Size</DetailLabel>
                      <DetailValue>{versionDetails[version].householdSize ? ethers.BigNumber.from(versionDetails[version].householdSize).toNumber() : "N/A"}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Household Income</DetailLabel>
                      <DetailValue>{versionDetails[version].householdIncome ? ethers.BigNumber.from(versionDetails[version].householdIncome).toNumber() : "N/A"}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Dependents</DetailLabel>
                      <DetailValue>{versionDetails[version].dependents ? ethers.BigNumber.from(versionDetails[version].dependents).toNumber() : "N/A"}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Income Source</DetailLabel>
                      <DetailValue>{versionDetails[version].incomeSource}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Income Frequency</DetailLabel>
                      <DetailValue>{versionDetails[version].incomeFrequency}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Income Amount</DetailLabel>
                      <DetailValue>{versionDetails[version].incomeAmount ? ethers.BigNumber.from(versionDetails[version].incomeAmount).toNumber() : "N/A"}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Income Notes</DetailLabel>
                      <DetailValue>{versionDetails[version].incomeNotes}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Occupation</DetailLabel>
                      <DetailValue>{versionDetails[version].occupation}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Employer</DetailLabel>
                      <DetailValue>{versionDetails[version].employer}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Years of Experience</DetailLabel>
                      <DetailValue>{versionDetails[version].yearsOfExperience ? ethers.BigNumber.from(versionDetails[version].yearsOfExperience).toNumber() : "N/A"}</DetailValue>
                    </DetailRow>  
                    <DetailRow>
                      <DetailLabel>Commitment Type</DetailLabel>
                      <DetailValue>{versionDetails[version].commitmentType}</DetailValue>
                    </DetailRow>  
                    <DetailRow>
                      <DetailLabel>Commitment Details</DetailLabel>
                      <DetailValue>{versionDetails[version].commitmentDetails}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Commitment Amount</DetailLabel>
                      <DetailValue>{versionDetails[version].commitmentAmount ? ethers.BigNumber.from(versionDetails[version].commitmentAmount).toNumber() : "N/A"}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Relief Type</DetailLabel>
                      <DetailValue>{versionDetails[version].reliefType}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Relief Details</DetailLabel>
                      <DetailValue>{versionDetails[version].reliefDetails}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Relief Amount</DetailLabel>
                      <DetailValue>{versionDetails[version].reliefAmount ? ethers.BigNumber.from(versionDetails[version].reliefAmount).toNumber() : "N/A"}</DetailValue>
                    </DetailRow>
                  </Details>
                  <ApplyButton onClick={() => applyVersion(version)}>
                    Apply Version {version-1}
                  </ApplyButton>
                  <Hover>Uploaded by {versionDetails[version].agencyName}</Hover>
                </DetailsWrapper>
              )}
            </VersionItem>
            
          ))}
        </VersionList>
        </MainContainer>
      </MainContent>
    </Container>
  );
};

export default Notification;
