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
  width: 70vw
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
  width: 180%;
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


const Income = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedVersion = location.state?.version;

  const [formData, setFormData] = useState({
    incomeSource: '',
    incomeFrequency: '',
    incomeAmount: '',
    incomeNotes: ''
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
            console.log("Available versions:", versions);

            if (selectedVersion) {
                console.log("Loading specific version:", selectedVersion);
                data = await contract.getUserDataByVersion(userIC, selectedVersion);
            } else {
                console.log("Loading current data");
                data = await contract.getCurrentUserData(userIC);
            }
            console.log("Received data:", data);

            // Check if data exists and has the expected properties
            if (data && typeof data === 'object') {
                setFormData({
                    incomeSource: data.incomeSource || '',
                    incomeFrequency: data.incomeFrequency || '',
                    incomeAmount: data.incomeAmount ? data.incomeAmount.toString() : '',
                    incomeNotes: data.incomeNotes || ''
                });
                console.log("Form data updated successfully:", {
                    incomeSource: data.incomeSource,
                    incomeFrequency: data.incomeFrequency,
                    incomeAmount: data.incomeAmount,
                    incomeNotes: data.incomeNotes
                });
            } else {
                console.log("No data found, setting default values");
                setFormData({
                    incomeSource: '',
                    incomeFrequency: '',
                    incomeAmount: '',
                    incomeNotes: ''
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
                    incomeSource: '',
                    incomeFrequency: '',
                    incomeAmount: '',
                    incomeNotes: ''
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
    if (!formData.incomeSource || !formData.incomeFrequency || !formData.incomeAmount) {
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

        // Send transaction with all required parameters
        const tx = await contract.storeUserData(
          userIC,
          // Personal Data
          currentData?.fullName || '',
          currentData?.gender || '',
          currentData?.DOB || 0,
          //User Account
          currentData?.passwordHash || '',
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
          formData.incomeSource,
          formData.incomeFrequency,
          parseInt(formData.incomeAmount),
          formData.incomeNotes,
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
          householdSize: formData.educationLevel,
          householdIncome: formData.graduationYear,
          dependents: formData.institution
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
          <Title>Income</Title>

          <GridContainer>
            <Label>SOURCE OF INCOME</Label>
            <SelectField 
            name="incomeSource"
            value={formData.incomeSource}
            onChange={handleInputChange}
            disabled={!!selectedVersion}
            required>
              <option value="">Select Source</option>
              <option value="Salary">Salary</option>
              <option value="Business">Business</option>
              <option value="Investment">Investment</option>
              <option value="Pension">Pension</option>
              <option value="Others">Others</option>
            </SelectField>
          </GridContainer>

          <GridContainer>
            <Label>FREQUENCY OF INCOME</Label>
            <SelectField 
            name="incomeFrequency"
            value={formData.incomeFrequency}
            onChange={handleInputChange}
            disabled={!!selectedVersion}
            required>
              <option value="">Select Frequency</option>
              <option value="Monthly">Monthly</option>
              <option value="Bi-Weekly">Bi-Weekly</option>
              <option value="Weekly">Weekly</option>
              <option value="Daily">Daily</option>
              <option value="One-Time">One-Time</option>
            </SelectField>
          </GridContainer>

          <GridContainer>
            <Label>INCOME</Label>
            <InputField 
              type="number" 
              placeholder="Income RM" 
              min ="0"
              name="incomeAmount"
              value={formData.incomeAmount}
              onChange={handleInputChange}
              disabled={!!selectedVersion}
              required
            />
          </GridContainer>

          <GridContainer>
            <Label>NOTES (OPTIONAL)</Label>
            <InputField 
              type="text" 
              name="incomeNotes"
              value={formData.incomeNotes}
              onChange={handleInputChange}
              disabled={!!selectedVersion}
              placeholder="Additional income details" 
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

export default Income; 