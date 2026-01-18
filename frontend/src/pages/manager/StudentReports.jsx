import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Download, Filter, Search, Eye, Award, TrendingUp,
  Calendar, FileText, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { usersAPI, attemptsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { formatDate } from '../../lib/utils';

const StudentReports = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll({ role: 'student' });
      
      // Mock enhanced data with performance metrics
      const studentsWithMetrics = (response.data?.users || []).map(student => ({
        ...student,
        exams_taken: Math.floor(Math.random() * 50) + 5,
        avg_score: Math.floor(Math.random() * 40) + 60,
        pass_rate: Math.floor(Math.random() * 30) + 65,
        last_exam: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.3 ? 'active' : 'inactive',
      }));

      setStudents(studentsWithMetrics);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const viewStudentDetails = async (student) => {
    setSelectedStudent(student);
    
    // Mock detailed student data
    setStudentDetails({
      ...student,
      recentAttempts: [
        { exam: 'Mathematics Final', score: 85, date: '2024-01-15', status: 'passed' },
        { exam: 'Science Quiz', score: 72, date: '2024-01-12', status: 'passed' },
        { exam: 'History Midterm', score: 58, date: '2024-01-08', status: 'failed' },
        { exam: 'English Literature', score: 91, date: '2024-01-05', status: 'passed' },
      ],
      strengths: ['Problem Solving', 'Critical Thinking', 'Time Management'],
      weaknesses: ['Essay Writing', 'Historical Dates', 'Complex Equations'],
      progress: [
        { month: 'Sep', score: 65 },
        { month: 'Oct', score: 70 },
        { month: 'Nov', score: 75 },
        { month: 'Dec', score: 78 },
        { month: 'Jan', score: 82 },
      ],
    });
  };

  const handleExportCSV = () => {
    toast.success('Exporting student reports...', {
      description: 'CSV file will be downloaded shortly'
    });
    
    // Mock CSV generation
    const csv = [
      ['Name', 'Email', 'Exams Taken', 'Avg Score', 'Pass Rate', 'Status'],
      ...filteredStudents.map(s => [
        s.name,
        s.email,
        s.exams_taken,
        `${s.avg_score}%`,
        `${s.pass_rate}%`,
        s.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filters.status || student.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading student reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="manager-student-reports">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Student Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive performance reports and analytics for all students
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Students',
              value: students.length,
              icon: Users,
              bgColor: 'bg-indigo-500/10',
              iconColor: 'text-indigo-500',
            },
            {
              title: 'Active Students',
              value: students.filter(s => s.status === 'active').length,
              icon: CheckCircle,
              bgColor: 'bg-green-500/10',
              iconColor: 'text-green-500',
            },
            {
              title: 'Avg Performance',
              value: `${Math.round(students.reduce((acc, s) => acc + s.avg_score, 0) / students.length || 0)}%`,
              icon: TrendingUp,
              bgColor: 'bg-orange-500/10',
              iconColor: 'text-orange-500',
            },
            {
              title: 'Avg Pass Rate',
              value: `${Math.round(students.reduce((acc, s) => acc + s.pass_rate, 0) / students.length || 0)}%`,
              icon: Award,
              bgColor: 'bg-pink-500/10',
              iconColor: 'text-pink-500',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Student Performance ({filteredStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Student</th>
                      <th className="text-left py-3 px-4 font-semibold">Exams Taken</th>
                      <th className="text-left py-3 px-4 font-semibold">Avg Score</th>
                      <th className="text-left py-3 px-4 font-semibold">Pass Rate</th>
                      <th className="text-left py-3 px-4 font-semibold">Last Exam</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{student.exams_taken}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  student.avg_score >= 80 ? 'bg-green-500' :
                                  student.avg_score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${student.avg_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{student.avg_score}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${
                            student.pass_rate >= 80 ? 'text-green-500' :
                            student.pass_rate >= 60 ? 'text-orange-500' : 'text-red-500'
                          }`}>
                            {student.pass_rate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(student.last_exam)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewStudentDetails(student)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No students found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Detail Modal */}
        {selectedStudent && studentDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-background z-10">
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-muted-foreground">{selectedStudent.email}</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{studentDetails.exams_taken}</p>
                      <p className="text-sm text-muted-foreground">Exams Taken</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Award className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{studentDetails.avg_score}%</p>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{studentDetails.pass_rate}%</p>
                      <p className="text-sm text-muted-foreground">Pass Rate</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Attempts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Exam Attempts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studentDetails.recentAttempts.map((attempt, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {attempt.status === 'passed' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-medium">{attempt.exam}</p>
                              <p className="text-sm text-muted-foreground">{attempt.date}</p>
                            </div>
                          </div>
                          <Badge variant={attempt.status === 'passed' ? 'success' : 'destructive'}>
                            {attempt.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {studentDetails.strengths.map((strength, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {studentDetails.weaknesses.map((weakness, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="text-sm">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentReports;
