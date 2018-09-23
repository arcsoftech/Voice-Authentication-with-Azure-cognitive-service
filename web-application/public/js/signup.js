document.addEventListener("DOMContentLoaded", function () {

    sessionStorage.phraseList = false;
    var progressSteps = 0;

    var queueObj = {

        title: 'Voice Enrollment',
        text: 'Please click below mic button to start and stop recording.After recording you can click on next',
        html: window.voiceInputTemplate({
            signup: true,
            phrase: ''
        }),
        showCancelButton: true,
        showLoaderOnConfirm: true,
        customClass: 'swal-wide',
        confirmButtonText: 'Next',
        allowOutsideClick: "false",
        progressSteps: ['1', '2', '3'],
        onBeforeOpen: () => {
            let tr = _.template(`<tr><td> <%= phrase %></td></tr>`)
            let table = document.getElementById("phraselist");
            if (JSON.parse(sessionStorage.phraseList)) {
                $("[data-toggle=popover]").popover({
                    html: true,
                    content: function () {
                        var content = $(this).attr("data-popover-content");
                        return $(content).children(".popover-body").html();
                    },
                    title: function () {
                        var title = $(this).attr("data-popover-content");
                        return $(title).children(".popover-heading").html();
                    }
                });
            } else {
                fetch('voice/list').then(res => {
                    return res.json()
                }).then(data => {
                    let tableData = _.chain(data)
                        .map(function (el) {
                            return el.phrase
                        })
                        .value();
                    console.log(tableData);
                    sessionStorage.phraseList = true
                    _.each(tableData, function (el) {
                        let row = table.insertRow(0);
                        let cell = row.insertCell(0);
                        cell.innerHTML = el;
                    })
                    $("[data-toggle=popover]").popover({
                        html: true,
                        content: function () {
                            var content = $(this).attr("data-popover-content");
                            return $(content).children(".popover-body").html();
                        },
                        title: function () {
                            var title = $(this).attr("data-popover-content");
                            return $(title).children(".popover-heading").html();
                        }
                    });

                })
            }
        },
        preConfirm: function () {
            return fetch(sessionStorage.getItem('File'))
                .then(res => res.blob())
                .then(blob => {
                    if (blob.type !== "audio/wav") {
                        alert("Please record audio to enroll.Please Start enrolling again.")
                        console.log(swal.getQueueStep())
                        let obj = queueObj;
                        obj.currentProgressStep = progressSteps;
                        swal.insertQueueStep(obj)
                    } else {
                        var form = new FormData();
                        sessionStorage.setItem("File", null);
                        form.append("file", blob);
                        return fetch(`voice/enroll/${sessionStorage.profileId}`, {
                                method: "POST",
                                body: form,
                                credentials: 'same-origin'
                            })
                            .then(function (res) {
                                return res.json();
                            })
                            .then(function (data) {
                                if (data.error) {
                                    alert(data.error.message)
                                    console.log(swal.getQueueStep())
                                    let obj = queueObj;
                                    obj.currentProgressStep = progressSteps;
                                    swal.insertQueueStep(obj)
                                } else {
                                    console.log(data);
                                    progressSteps += 1;
                                    let obj = queueObj;
                                    obj.currentProgressStep = progressSteps;
                                    if (progressSteps < 3) {
                                        swal.insertQueueStep(obj)
                                    }
                                }

                            })
                    }
                }).catch((err) => {
                    console.log(err)

                    swal.insertQueueStep({
                        type: 'error',
                        title: err.message
                    })

                })
        }
    }
    swal({
        title: 'Do you want to enrol in voice authentication?',
        text: "Voice authentication is the alternative way of entering to site.",
        type: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        allowOutsideClick: "false",
        showLoaderOnConfirm: true,
        preConfirm: (login) => {
            return fetch(`voice/create`, {
                    credentials: 'same-origin'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText)
                    }
                    return response.json()
                })
                .catch(error => {
                    swal.showValidationError(
                        `Request failed: ${error}`
                    )
                })
        },
        allowOutsideClick: () => !swal.isLoading()
    }).then((result) => {
        if (result.value) {
            var profileId = result.value.verificationProfileId;
            sessionStorage.profileId = profileId
            console.log(profileId)
            swal.queue([queueObj]).then(data => {
                if (data.dismiss) {
                    swal(
                        'Fail!',
                        'Enrollment Fail',
                        'warning'
                    )
                } else {
                    swal(
                        'Good job!',
                        'Enrollment Succesful',
                        'success'
                    ).then(() => {
                        self.location = "dashboard";
                    })
                }
            })
        } else {
            self.location = "dashboard";
        }
    })
});