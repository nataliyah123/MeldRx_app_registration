const madge = require('madge');

madge('C:/Users/sumairaibiA/Code/fhir/test_app/patient_view/meldrx-template-app-patient-viewer-nextjs/app/page.tsx').then((res) => {
	console.log(res.obj());
});
// console.log("files",all_files)