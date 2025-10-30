const fs = require('fs');
const vm = require('vm');
const files = [
  '/private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI/SchedulePatient.js',
  '/private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI/ReschedulePatient',
  '/private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI/LookupCurrentAppointment',
  '/private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI/FirstAvailable',
  '/private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI/FindPatientWithId',
  '/private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI/FindPatient',
  '/private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI/CreatePatient',
  '/private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI/ConfirmPatient',
  '/private/tmp/aws-toolkit-vscode/lambda/us-west-1/AthenaAPI/CancelPatient.js'
];
let ok = true;
files.forEach(f => {
  try {
    const src = fs.readFileSync(f, 'utf8');
    vm.createScript(src, { filename: f });
  } catch (e) {
    console.error('\nSYNTAX ERROR in', f, ':', e.message);
    ok = false;
  }
});
if (!ok) process.exit(2);
console.log('Syntax check passed for', files.length, 'files');
