export default [
  {
    id: "addAttendance",
    target: "#add-attendance",
    placement: "left",
    title: "Add attendance",
    content: `
    <p>
      Attendances represent time blocks in which you were at the workplace.
      They don't count as worktime but are a help for you to roughly guess the
      worktime you should have.
    </p>
    <p>
      To add a new attendance just click here.
    </p>
    `,
  },
  {
    id: "editAttendance",
    target: ".attendances",
    placement: "top",
    title: "Edit attendance",
    content: `
    <p>
      Now you can just adjust the time block by grabbing and moving it or
      grabbing it on one of the ends and adjusting the start or end time. The
      attendance saves automatically after every change.
    </p>
    <p>
      You can add as many attendances per day as you want.
    </p>
    `,
  },
];
