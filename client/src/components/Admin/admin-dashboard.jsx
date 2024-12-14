import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import MyDentityLogo from '../../assets/MyDentityLogo.png';
import { CONTRACT_ADDRESS } from '../../contracts/contract.js';
import { ethers } from "ethers";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import MyDentityContract from '../../contracts/MyDentity.json';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const PageDescription = styled.div`
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;

`;

const AnalyticsCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  h3{
    color: #666;
    font-size: 16px;
    margin-bottom: 15px;
    gap: 8px;
  }
`;

const CardTitle = styled.h3`
  color: #666;
  font-size: 16px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardValue = styled.div`
  color: #2c2c2c;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const CardTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: ${props => props.increase ? '#28a745' : '#dc3545'};
`;

const ChartContainer = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  grid-column: span 3;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalAgencies: 0,
    totalUpdates: 0,
  });

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

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyDentityContract.abi,
        provider
      );

      // Fetch and convert BigNumber values to regular numbers
      const totalUsers = await contract.getTotalUsers();
      const totalAgencies = await contract.getTotalAgencies();
      const totalUpdates = await contract.getTotalUpdates();

      // Update analytics state with converted numbers
      setAnalytics({
        totalUsers: totalUsers.toNumber(),
        totalAgencies: totalAgencies.toNumber(),
        totalUpdates: totalUpdates.toNumber()
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  return (
    <Container>
      <Sidebar>
        <Logo src={MyDentityLogo} alt="MyDentity Logo" />
        <MenuSection>
          <MenuItem active onClick={() => navigate('/admin-dashboard')}>
            📊 DASHBOARD
          </MenuItem>
          <MenuItem onClick={() => navigate('/admin-citizens')}>
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

        <PageDescription>
          <DescriptionTitle>System Overview</DescriptionTitle>
          <DescriptionText>
          Monitor key metrics of MyDentity. Track user registrations, agency activities, and data management statistics.
          </DescriptionText>
        </PageDescription>

        <AnalyticsGrid>
          <AnalyticsCard>
            <h3>Total Users</h3>
            <h2>{analytics.totalUsers || 0}</h2>
          </AnalyticsCard>
          <AnalyticsCard>
            <h3>Total Agencies</h3>
            <h2>{analytics.totalAgencies || 0}</h2>
          </AnalyticsCard>
          <AnalyticsCard>
            <h3>Total User Version</h3>
            <h2>{analytics.totalUpdates || 0}</h2>
          </AnalyticsCard>
        </AnalyticsGrid>
      </MainContent>
    </Container>
  );
};

export default Dashboard; 