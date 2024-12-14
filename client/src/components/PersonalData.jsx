import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ethers } from "ethers";
import styled from 'styled-components';
import MyDentityLogo from '../assets/MyDentityLogo.png';
import MyDentityContract from '../contracts/MyDentity.json';
import { CONTRACT_ADDRESS } from '../contracts/contract.js';
// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 90vh;
  width: 70vw;
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
  align-items: center;
  padding: 12px;
  cursor: pointer;
  color: ${props => props.active ? '#ffcc33' : '#666'};
  background-color: ${props => props.active ? '#fff3d9' : 'transparent'};
  border-radius: 5px;
  margin-bottom: 5px;

  &:hover {
    background-color: #fff3d9;
    color: #ffcc33;
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
  padding: 10px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
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
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: auto;

  &:hover {
    background-color: #c82333;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 50px;
  text-align: center;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MainContainer = styled.div`
  background-color: white;
  padding: 5%;
  margin: 2%;
`;

const InputField = styled.input`
  width:  150%;
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
  width: 185%;
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

const Label = styled.div`
  font-weight: bold;
  color:  #757474;
  padding: 20px;
`;

const Title = styled.div`
  color: grey;
  font-size: 40px;
  font-weight: bold;
  margin: 45px;
`;

const StoreButton = styled.button`
  width: 30%;
  background-color: #ffcc33;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #e6b800;
  }
`;


const PersonalData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedVersion = location.state?.version;

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    DOB: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
        const userIC = localStorage.getItem('userIC');
        if (!userIC) {
            navigate('/');
        } else if (mounted) {
            await loadVersionData(userIC);
        }
    };

    init();

    return () => {
        mounted = false;
    };
  }, [navigate, selectedVersion]);

  const loadVersionData = async (userIC) => {
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

        let data;
        let userVersion;
        try {
            // Get all versions to check if user has any data
            const versions = await contract.getUserDataVersions(userIC);

            if (selectedVersion) {
                data = await contract.getUserDataByVersion(userIC, selectedVersion);
            } else {
                console.log("Loading current data");
                data = await contract.getCurrentUserData(userIC);
            }
            console.log("Received data:", data);

            // Check if data exists and has the expected properties
            if (data && typeof data === 'object') {
                const baseYearTimestamp = Math.floor(new Date('1900-01-01T00:00:00Z').getTime() / 1000);
                const originalTimestamp = data.DOB.toNumber() + baseYearTimestamp;
                const formattedDOB = originalTimestamp ? new Date(originalTimestamp * 1000).toISOString().split('T')[0] : '';
                console.log("Formatted DOB:", formattedDOB);
                setFormData({
                    fullName: data.fullName || '',
                    gender: data.gender || '',
                    DOB: formattedDOB || '',
                });
                console.log("Form data updated successfully:", {
                    fullName: data.fullName,
                    gender: data.gender,
                    DOB: formattedDOB
                });
            } else {
                console.log("No data found, setting default values");
                setFormData({
                    fullName: '',
                    gender: '',
                    DOB: ''
                });
            }

        } catch (error) {
            console.error("Data fetch error:", error);
            
            // Handle specific error cases
            if (error.message.includes("User not registered")) {
                throw new Error("User not registered in the system");
            } else if (error.message.includes("No data stored")) {
                console.log("No existing data, setting default values");
                setFormData({
                    fullName: '',
                    gender: '',
                    DOB: ''
                });
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error("Detailed error:", error);
        
        let errorMessage = "Error loading data: ";
        if (error.code === 'ACTION_REJECTED') {
            errorMessage += "Transaction was rejected in MetaMask";
        } else if (error.message.includes("User not registered")) {
            errorMessage += "User not registered in the system";
        } else if (error.message.includes("No data stored")) {
            errorMessage += "No data has been stored yet";
        } else if (error.message.includes("Invalid version")) {
            errorMessage += "Invalid version number";
        } else if (error.message.includes("Unauthorized access")) {
            errorMessage += "Unauthorized access";
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.gender || !formData.DOB) {
        alert("Please fill in all fields");
        return;
    }

    setIsLoading(true);

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            MyDentityContract.abi,
            signer
        );

        // Get current data
        const userIC = localStorage.getItem('userIC');
        const currentData = await contract.getCurrentUserData(userIC);

        const baseYear = 1900;
        const baseYearTimestamp = Math.floor(new Date(`${baseYear}-01-01T00:00:00Z`).getTime() / 1000);
        const CaldobTimestamp = Math.floor(new Date(formData.DOB).getTime() / 1000);
        const dobTimestamp = CaldobTimestamp - baseYearTimestamp;
        console.log("DOB Timestamp:", dobTimestamp);
        console.log("Initial DOB Timestamp:", CaldobTimestamp);
        console.log("Base DOB Timestamp:", baseYearTimestamp);

        const tx = await contract.storeUserData(
          userIC,
          // Personal Data
          formData.fullName,
          formData.gender,
          dobTimestamp,
          //User Account
          currentData?.passwordHash,
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
        
        alert("Data saved successfully!");
        navigate('/main-menu');
        console.log("Data saved successfully:", {
          fullName: formData.fullName,
          gender: formData.gender,
          dobTimestamp: formData.dobTimestamp,
        });
        setIsLoading(false);
    } catch (error) {
        console.error("Error submitting data:", error);
        alert("An error occurred while saving your data.");
        setIsLoading(false);
    }
  };

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
          <LogoutButton onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>
            LOG OUT
          </LogoutButton>
        </Header>

        <MainContainer>
          <Title>Personal Data</Title>

          <GridContainer>
            <Label>FULL NAME</Label>
            <InputField 
                type="text" 
                placeholder="Name" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!!selectedVersion}
                required 
            />
          </GridContainer>

          <GridContainer>
          <Label>GENDER</Label>
            <SelectField 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!!selectedVersion}
                  required 
            >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
            </SelectField>
          </GridContainer>

          <GridContainer>
            <Label>D.O.B</Label>
              <InputField 
                  type="date" 
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleInputChange}
                  disabled={!!selectedVersion}
                  required 
              />
          </GridContainer>

          <StoreButton onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Store"}
          </StoreButton>
        </MainContainer>
      </MainContent>
    </Container>
  );
};

export default PersonalData; 