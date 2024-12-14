import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MyDentityLogo from '../../assets/MyDentityLogo.png';
import * as XLSX from 'xlsx';
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


const UserDetail = styled.div`
  color: #ddd;
  font-size: 16px;
  text-align: left;
  margin-top: 5%;
  p {
    margin: 15px 0;
    color: #555;
    letter-spacing: 2px;
  }

  h1{
    color: #ddddd;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    border-bottom: 3px solid #ffcc33;
    width: 30%;
    padding-bottom: 10px;
  }

`;

const ContentContainer = styled.div`
  background: #ffff;
  padding: 50px;
  min-height: 40vh;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 60%;
  margin: auto;
  margin-top: 2%;
  margin-bottom: 2%;
  transition: all 0.3s ease;

  &:hover {
    background-color: #fff;
    transform: translateX(5px);
  }
`;

const Title = styled.h3`
  color: #555;
  font-size: 45px;
  text-align: left;
`;

const DownloadButton = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => (props.color === "pdf" ? "#dc3545" : "#28a745")};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: ${(props) => (props.color === "pdf" ? "#c82333" : "#218838")};
  }
`;

const PageDescription = styled.div`
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 5% 5% 5% 5%;
  border-radius: 15px;
  margin-bottom: 25px;
  position: relative;
`;

const DescriptionTitle = styled.h2`
  color: #2c2c2c;
  font-size: 20px;
  font-weight: 600;
  align-items: center;
  gap: 10px;
  margin: auto;
  border-bottom: 3px solid #ffcc33;
  padding-bottom: 20px;
  width: 30%;

  &::before {
    content: '📋';
    font-size: 24px;
  }
`;

const DescriptionText = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  width: 70%;
  margin: auto;
  margin-top: 3%;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 70%;
  margin: auto;
`;

const AgencyUserDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = location.state || {}; // Retrieve userData from Router state

  const [userInfo, setUserInfo] = useState({
    ID: localStorage.getItem("ID") || "",
    agencyName: localStorage.getItem("agencyName") || "",
    agencyContact: localStorage.getItem("agencyContact") || "",
    
  });

  const exportToExcel = (userData) => {
    // Prepare data for Excel
    const data = [
        {
          // Personal Data
          Full_Name: userData.fullName,
          Gender: userData.gender,
          DOB: new Date(ethers.BigNumber.from(userData.DOB).toNumber() * 1000).toLocaleDateString(), // Convert UNIX timestamp to date
          
          // Address
          Home_Address: userData.homeAddress,
          State: userData.state,
          City: userData.city,
          Zip_Code: userData.zipCode,
    
          // Education
          Education_Level: userData.educationLevel,
          Graduation_Year: ethers.BigNumber.from(userData.graduationYear).toNumber(),
          Institution: userData.institution,
    
          // Household
          Household_Size: ethers.BigNumber.from(userData.householdSize).toNumber(),
          Household_Income: ethers.BigNumber.from(userData.householdIncome).toNumber(),
          Dependents: ethers.BigNumber.from(userData.dependents).toNumber(),
    
          // Income
          Income_Source: userData.incomeSource,
          Income_Frequency: userData.incomeFrequency,
          Income_Amount: ethers.BigNumber.from(userData.incomeAmount).toNumber(),
          Income_Notes: userData.incomeNotes,
    
          // Occupation
          Occupation: userData.occupation,
          Employer: userData.employer,
          Years_of_Experience: ethers.BigNumber.from(userData.yearsOfExperience).toNumber(),
    
          // Commitment
          Commitment_Type: userData.commitmentType,
          Commitment_Details: userData.commitmentDetails,
          Commitment_Amount: ethers.BigNumber.from(userData.commitmentAmount).toNumber(),
    
          // Relief
          Relief_Type: userData.reliefType,
          Relief_Details: userData.reliefDetails,
          Relief_Amount: ethers.BigNumber.from(userData.reliefAmount).toNumber(),
        },
      ];
  
    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const name = 'UserData_' + userData.fullName + '.xlsx';
  
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Data');
  
    // Generate and download the Excel file
    XLSX.writeFile(workbook, name);
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

        <PageDescription>
          <DescriptionTitle>Citizen Data Details</DescriptionTitle>
          <DescriptionText>
            View comprehensive citizen information including personal data, address, education, 
            household details, and more. You can download this information as an Excel file 
            for your records or further processing.
          </DescriptionText>
        </PageDescription>

        <ActionBar>
          <Title>{userData.fullName}</Title>
          <DownloadButton onClick={() => exportToExcel(userData)}>
            Download as Excel
          </DownloadButton>
        </ActionBar>

        <ContentContainer>
          <UserDetail>
                <h1><b>PERSONAL DATA</b></h1>
                <p><b>Name:</b> {userData.fullName}</p>
                <p><b>Gender:</b> {userData.gender}</p>
                <p><b>Date of Birth:</b> {
                userData.DOB ? new Date(ethers.BigNumber.from(userData.DOB).toNumber() * 1000).toLocaleDateString() : "N/A"
                }</p><br />

                <h1><b>ADDRESS</b></h1>
                <p><b>Address:</b> {userData.homeAddress}</p>
                <p><b>State:</b> {userData.state}</p>
                <p><b>City:</b> {userData.city}</p>
                <p><b>ZipCode:</b> {userData.zipCode}</p><br />

                <h1><b>Education</b></h1>
                <p><b>Education Level:</b> {userData.educationLevel}</p>
                <p><b>Graduation Year:</b> {
                    userData.graduationYear ? ethers.BigNumber.from(userData.graduationYear).toNumber() : "N/A"
                }</p>
                <p><b>Insitution:</b> {userData.institution}</p><br />

                <h1><b>Household</b></h1>
                <p><b>Household Size:</b> {
                    userData.householdSize ? ethers.BigNumber.from(userData.householdSize).toNumber() : "N/A"
                }</p>
                <p><b>Household Income:</b> {
                    userData.householdIncome ? ethers.BigNumber.from(userData.householdIncome).toNumber() : "N/A"
                }</p>
                <p><b>Dependents:</b> {
                    userData.dependents ? ethers.BigNumber.from(userData.dependents).toNumber() : "N/A"
                }</p><br />

                <h1><b>Income</b></h1>
                <p><b>Income Source:</b> {userData.incomeSource}</p>
                <p><b>Income Frequency:</b> {userData.incomeFrequency}</p>
                <p><b>Income Amount:</b> {
                    userData.incomeAmount ? ethers.BigNumber.from(userData.incomeAmount).toNumber() : "N/A"
                }</p>
                <p><b>Income Notes:</b> {userData.incomeNotes}</p><br />

                <h1><b>Occupation</b></h1>
                <p><b>Occupation:</b> {userData.occupation}</p>
                <p><b>Employer:</b> {userData.employer}</p>
                <p><b>Years Of Experience:</b> {
                    userData.commitmentAmount ? ethers.BigNumber.from(userData.yearsOfExperience).toNumber() : "N/A"
                }</p><br />

                <h1><b>Commitment</b></h1>
                <p><b>Commitment Type:</b> {userData.commitmentType}</p>
                <p><b>Commitment Details:</b> {userData.commitmentDetails}</p>
                <p><b>Commitment Amount:</b> {
                    userData.commitmentAmount ? ethers.BigNumber.from(userData.commitmentAmount).toNumber() : "N/A"
                }</p><br />

                <h1><b>Relief</b></h1>
                <p><b>Relief Type:</b> {userData.reliefType}</p>
                <p><b>Relief Details:</b> {userData.reliefDetails}</p>
                <p><b>Relief Amount:</b> {
                    userData.commitmentAmount ? ethers.BigNumber.from(userData.reliefAmount).toNumber() : "N/A"
                }</p><br />


            </UserDetail>
        </ContentContainer>
      </MainContent>
    </Container>
  );
};

export default AgencyUserDetail; 