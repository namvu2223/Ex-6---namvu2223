var express = require('express');
var app = express();
const bodyParser  = require('body-parser');

// Required module to make calls to a REST API
const axios = require('axios');


// Set the view engine to ejs
app.set('view engine', 'ejs');

// API Endpoint
const apiURL = 'https://cg7bzwd7vkkgswhukeoxeg2oku0jbnak.lambda-url.us-east-2.on.aws';

app.use(bodyParser.urlencoded({ extended: true })); 


// Function to calculate averages 
function calculateAverages(student) {
    var avgHomework = 0;
    var avgExam = 0;

    if (student && student.scores) {
        // Calculate homework average
        if (student.scores.homework && student.scores.homework.length > 0) {
            var sumHomework = 0;
            for (var i = 0; i < student.scores.homework.length; i++) {
                sumHomework += student.scores.homework[i];
            }
            avgHomework = sumHomework / student.scores.homework.length;
        }
        // Calculate exam average
        if (student.scores.exams && student.scores.exams.length > 0) {
            var sumExams = 0;
            for (var i = 0; i < student.scores.exams.length; i++) {
                sumExams += student.scores.exams[i];
            }
            avgExam = sumExams / student.scores.exams.length;
        }
    }
    // Return an object with the averages
    return { avgHomework: avgHomework, avgExam: avgExam };
}


// GET request 
app.get('/', function(req, res) {
    // Fetch all students from the API
    axios.get(apiURL)
        .then(function(response) {
            res.render('index', {
                students: response.data, 
            });
        })
        .catch(function(error) {
            console.error("GET / Error:", error.message);
            res.render('index', {
                students: [], 
                error: "Could not load student data."
            });
        });
});

// POST request 
app.post('/', function(req, res) {
    var selectedStudentId = req.body.studentId; 

    // Fetch all students from the API again
    axios.get(apiURL)
        .then(function(response) {
            var students = response.data;
            var selectedStudent = null;
            var averagesObj = { avgHomework: undefined, avgExam: undefined }; 

            // Find the selected student
            for (var i = 0; i < students.length; i++) {
                if (students[i].id == selectedStudentId) {
                    selectedStudent = students[i];
                    break;
                }
            }

            // If student found, call the function to calculate averages
            if (selectedStudent) {
                averagesObj = calculateAverages(selectedStudent); 

            // Render the page with the calculated data
            res.render('index', {
                students: students,                       
                selectedStudentId: selectedStudentId,      
                avgHomework: averagesObj.avgHomework,         
                avgExam: averagesObj.avgExam                 
            });

        }})
        .catch(function(error) {
            console.error("POST / Error:", error.message);
             res.render('index', {
                students: [], 
                selectedStudentId: selectedStudentId, 
                error: "Could not process request or find student data."
            });
        });
});


const PORT = 3000; 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});