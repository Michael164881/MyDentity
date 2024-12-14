import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './register';
import PersonalData from './components/PersonalData';
import Address from './components/Address';
import Education from './components/Education';
import Household from './components/Household';
import Occupation from './components/Occupation';
import Income from './components/Income';
import Commitment from './components/Commitment';
import Relief from './components/Relief';
import UserAccount from './components/UserAccount';
import MainMenu from './components/MainMenu';
import ManageAccess from './components/ManageAccess';
import DataVersions from './components/DataVersions';
import AdminDashboard from './components/Admin/admin-dashboard';
import AdminAgencies from './components/Admin/admin-agencies';
import AdminCitizens from './components/Admin/admin-citizens';
import AdminAgenciesRegister from './components/Admin/admin-agencies-register';
import AdminAgenciesEdit from './components/Admin/admin-agencies-edit';
import AdminBulkData from './components/Admin/admin-bulkData';
import AgencyDashboard from './components/Agency/agency-dashboard';
import AgencyUserDetail from './components/Agency/agency-userDetail';
import AgencyBulkData from './components/Agency/agency-bulkData';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main-menu" element={<MainMenu />} />
        <Route path="/personal-data" element={<PersonalData />} />
        <Route path="/address" element={<Address />} />
        <Route path="/education" element={<Education />} />
        <Route path="/household" element={<Household />} />
        <Route path="/occupation" element={<Occupation />} />
        <Route path="/income" element={<Income />} />
        <Route path="/commitment" element={<Commitment />} />
        <Route path="/relief" element={<Relief />} />
        <Route path="/user-account" element={<UserAccount />} />
        <Route path="/ManageAccess" element={<ManageAccess />} />
        <Route path="/DataVersions" element={<DataVersions />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-citizens" element={<AdminCitizens />} />
        <Route path="/admin-agencies" element={<AdminAgencies />} />
        <Route path="/admin-agencies-register" element={<AdminAgenciesRegister />} />
        <Route path="/admin-agencies-edit" element={<AdminAgenciesEdit />} />
        <Route path="/admin-BulkData" element={<AdminBulkData />} />

        <Route path="/agency-dashboard" element={<AgencyDashboard />} />
        <Route path="/agency-userDetail" element={<AgencyUserDetail />} />
        <Route path="/agency-bulkData" element={<AgencyBulkData />} />
      </Routes>
    </Router>
  );
};

export default App;