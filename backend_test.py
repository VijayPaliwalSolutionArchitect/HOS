#!/usr/bin/env python3
"""
EduExam Pro Backend API Testing Suite
=====================================
Comprehensive testing for the EdTech SaaS platform backend APIs
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class EduExamAPITester:
    def __init__(self, base_url: str = "https://95cffa92-129d-4027-8715-a224aea9c6d3.preview.emergentagent.com"):
        self.base_url = base_url
        self.tokens = {}  # Store tokens for different roles
        self.users = {}   # Store user data for different roles
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials
        self.credentials = {
            'student': {'email': 'student@eduexam.com', 'password': 'student123'},
            'manager': {'email': 'manager@eduexam.com', 'password': 'manager123'},
            'admin': {'email': 'admin@eduexam.com', 'password': 'admin123'}
        }

    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({
                'test': test_name,
                'details': details
            })

    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    role: Optional[str] = None, expected_status: int = 200) -> Dict[str, Any]:
        """Make HTTP request with optional authentication"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add auth token if role specified
        if role and role in self.tokens:
            headers['Authorization'] = f'Bearer {self.tokens[role]}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            return {
                'status_code': response.status_code,
                'data': response_data,
                'success': response.status_code == expected_status
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'status_code': 0,
                'data': {'error': str(e)},
                'success': False
            }

    def test_health_check(self):
        """Test API health endpoint"""
        result = self.make_request('GET', 'health')
        success = result['success'] and result['data'].get('status') == 'healthy'
        self.log_test("Health Check", success, 
                     f"Status: {result['status_code']}, Response: {result['data'].get('status', 'N/A')}")
        return success

    def test_authentication(self):
        """Test authentication for all roles"""
        all_success = True
        
        for role, creds in self.credentials.items():
            result = self.make_request('POST', 'auth/login', creds)
            
            if result['success'] and 'access_token' in result['data']:
                self.tokens[role] = result['data']['access_token']
                self.users[role] = result['data']['user']
                self.log_test(f"Login - {role.title()}", True, 
                             f"Token received, User: {result['data']['user']['name']}")
            else:
                self.log_test(f"Login - {role.title()}", False, 
                             f"Status: {result['status_code']}, Error: {result['data']}")
                all_success = False
        
        return all_success

    def test_user_profile(self):
        """Test user profile endpoints"""
        all_success = True
        
        for role in self.credentials.keys():
            if role not in self.tokens:
                continue
                
            # Test get profile
            result = self.make_request('GET', 'auth/me', role=role)
            success = result['success'] and result['data'].get('email') == self.credentials[role]['email']
            self.log_test(f"Get Profile - {role.title()}", success,
                         f"Email: {result['data'].get('email', 'N/A')}")
            if not success:
                all_success = False
        
        return all_success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        all_success = True
        
        for role in self.credentials.keys():
            if role not in self.tokens:
                continue
                
            result = self.make_request('GET', 'dashboard/stats', role=role)
            success = result['success'] and isinstance(result['data'], dict)
            
            # Check role-specific stats
            if success:
                if role == 'student':
                    required_keys = ['my_exams_taken', 'my_average_score', 'my_xp_points']
                else:
                    required_keys = ['total_users', 'total_courses', 'total_exams']
                
                has_required = all(key in result['data'] for key in required_keys)
                success = success and has_required
            
            self.log_test(f"Dashboard Stats - {role.title()}", success,
                         f"Keys: {list(result['data'].keys()) if success else 'Failed'}")
            if not success:
                all_success = False
        
        return all_success

    def test_categories(self):
        """Test categories endpoints"""
        all_success = True
        
        # Test get categories (all roles should access)
        for role in self.credentials.keys():
            if role not in self.tokens:
                continue
                
            result = self.make_request('GET', 'categories', role=role)
            success = result['success'] and isinstance(result['data'], list)
            self.log_test(f"Get Categories - {role.title()}", success,
                         f"Count: {len(result['data']) if success else 'Failed'}")
            if not success:
                all_success = False
        
        return all_success

    def test_courses(self):
        """Test courses endpoints"""
        all_success = True
        
        # Test get courses
        for role in self.credentials.keys():
            if role not in self.tokens:
                continue
                
            result = self.make_request('GET', 'courses', role=role)
            success = result['success'] and 'courses' in result['data']
            self.log_test(f"Get Courses - {role.title()}", success,
                         f"Count: {len(result['data'].get('courses', [])) if success else 'Failed'}")
            if not success:
                all_success = False
        
        return all_success

    def test_exams_student(self):
        """Test exam endpoints for students"""
        if 'student' not in self.tokens:
            return False
            
        all_success = True
        
        # Get available exams
        result = self.make_request('GET', 'exams', role='student')
        success = result['success'] and 'exams' in result['data']
        self.log_test("Get Exams - Student", success,
                     f"Available exams: {len(result['data'].get('exams', [])) if success else 'Failed'}")
        
        if not success:
            return False
        
        exams = result['data'].get('exams', [])
        if not exams:
            self.log_test("Start Exam - Student", False, "No exams available to test")
            return False
        
        # Try to start an exam
        exam_id = exams[0]['id']
        result = self.make_request('POST', f'exams/{exam_id}/start', role='student')
        success = result['success'] and 'attempt_id' in result['data']
        self.log_test("Start Exam - Student", success,
                     f"Attempt ID: {result['data'].get('attempt_id', 'N/A') if success else 'Failed'}")
        
        if not success:
            all_success = False
        
        return all_success

    def test_questions_manager(self):
        """Test question endpoints for managers"""
        if 'manager' not in self.tokens:
            return False
            
        # Get questions
        result = self.make_request('GET', 'questions', role='manager')
        success = result['success'] and 'questions' in result['data']
        self.log_test("Get Questions - Manager", success,
                     f"Count: {len(result['data'].get('questions', [])) if success else 'Failed'}")
        
        return success

    def test_users_admin(self):
        """Test user management for admin"""
        if 'admin' not in self.tokens:
            return False
            
        # Get users
        result = self.make_request('GET', 'users', role='admin')
        success = result['success'] and 'users' in result['data']
        self.log_test("Get Users - Admin", success,
                     f"Count: {len(result['data'].get('users', [])) if success else 'Failed'}")
        
        return success

    def test_role_based_access(self):
        """Test role-based access control"""
        all_success = True
        
        # Student should NOT access admin endpoints
        if 'student' in self.tokens:
            result = self.make_request('GET', 'users', role='student', expected_status=403)
            success = result['status_code'] == 403
            self.log_test("Access Control - Student->Users", success,
                         f"Expected 403, got {result['status_code']}")
            if not success:
                all_success = False
        
        # Student should NOT access manager endpoints
        if 'student' in self.tokens:
            result = self.make_request('GET', 'questions', role='student', expected_status=403)
            success = result['status_code'] == 403
            self.log_test("Access Control - Student->Questions", success,
                         f"Expected 403, got {result['status_code']}")
            if not success:
                all_success = False
        
        return all_success

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting EduExam Pro Backend API Tests")
        print("=" * 50)
        
        # Core API tests
        self.test_health_check()
        
        # Authentication tests
        auth_success = self.test_authentication()
        if not auth_success:
            print("❌ Authentication failed - stopping tests")
            return False
        
        # Profile tests
        self.test_user_profile()
        
        # Dashboard tests
        self.test_dashboard_stats()
        
        # Content tests
        self.test_categories()
        self.test_courses()
        
        # Role-specific tests
        self.test_exams_student()
        self.test_questions_manager()
        self.test_users_admin()
        
        # Security tests
        self.test_role_based_access()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = EduExamAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())