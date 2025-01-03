import React from 'react';
import { Link } from 'react-router-dom'
import DisplayID from '../components/DisplayID'

function StudentInformation() {
    return (
        <div>
            <DisplayID route='/api/users/' />
        </div>
    );
}

export default StudentInformation;