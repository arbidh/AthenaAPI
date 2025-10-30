const modulesToTest = [
  {
    name: 'FindPatient',
    path: './FindPatient',
    event: { body: JSON.stringify({ args: { firstName: 'John', lastName: '', phone: '', dateOfBirth: '' } }) },
  },
  {
    name: 'FindPatientWithId',
    path: './FindPatientWithId',
    event: { body: JSON.stringify({ args: { patientID: '12345' } }), headers: {} },
  },
  {
    name: 'CreatePatient',
    path: './CreatePatient',
    event: { body: JSON.stringify({ args: { firstName: 'John', lastName: 'Doe', phone: '5551234567', dateOfBirth: '01/01/1990' } }) },
  },
  {
    name: 'FirstAvailable',
    path: './FirstAvailable',
    event: { body: JSON.stringify({ args: { providerid: 1, appointmentDate: '', appointmentTime: '', patientid: 1, departmentid: 1, appointmenttypeid: 1 } }) },
  },
  {
    name: 'LookupCurrentAppointment',
    path: './LookupCurrentAppointment',
    event: { body: JSON.stringify({ args: { patientid: 1, departmentid: 1 } }) },
  },
  {
    name: 'SchedulePatient',
    path: './SchedulePatient',
    event: { body: JSON.stringify({ args: { patientid: 1, providerid: 1, departmentid: 1, existing: false, appointmentid: '1', appointmenttypeid: 1 } }) },
  },
  {
    name: 'ReschedulePatient',
    path: './ReschedulePatient',
    event: { body: JSON.stringify({ args: { patientid: 1, appointmentid: '1', newappointmentid: '2', appointmentDate: '', appointmentTime: '', providerid: 1, departmentid: 1 } }) },
  },
  {
    name: 'ConfirmPatient',
    path: './ConfirmPatient',
    event: { body: JSON.stringify({ args: { providerid: 1, appointmentDate: '', appointmentTime: '', patientid: 1, existing: false, departmentid: 1 } }) },
  },
  {
    name: 'CancelPatient',
    path: './CancelPatient.js',
    event: { body: JSON.stringify({ args: { appointmentid: '1', patientid: 1 } }) },
  }
];

(async () => {
  for (const mod of modulesToTest) {
    console.log('\n=== Running', mod.name, '===');
    try {
      const handlerModule = require(mod.path);
      const result = await handlerModule.handler(mod.event);
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Error invoking', mod.name, ':', err.stack || err.message || err);
      if (err.response && err.response.data) {
        console.error('Response data:', JSON.stringify(err.response.data, null, 2));
      }
    }
  }
})();
