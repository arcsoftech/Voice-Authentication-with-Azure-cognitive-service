document.addEventListener("DOMContentLoaded", function () {

    var progressSteps = 0;
    var queueObj = {
        title: 'Voice Login',
        text: 'Please click below mic button to start and stop recording.After recording you can click on next',
        html: window.voiceInputTemplate({
            signup: false,
            phrase: sessionStorage.VoicePhrase
        }),
        showLoaderOnConfirm: true,
        customClass: 'swal-wide',
        confirmButtonText: 'Login',
        allowOutsideClick: "false",
        onOpen: () => {
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
        },
        preConfirm: function () {
            return fetch(sessionStorage.getItem('File'))
                .then(res => res.blob())
                .then(blob => {
                    if (blob.type !== "audio/wav") {
                        alert("Please record audio to login.Please Start enrolling again.")
                        console.log(swal.getQueueStep())
                        let obj = queueObj;
                        obj.currentProgressStep = progressSteps;
                        swal.insertQueueStep(obj)
                    } else {
                        var form = new FormData();
                        sessionStorage.setItem("File", null);
                        form.append("file", blob);
                        return fetch(`voice/verify/${sessionStorage.profileId}`, {
                                method: "POST",
                                body: form,
                                credentials: 'same-origin'
                            })
                            .then(function (res) {
                                console.log("response".res);
                                return res.json();
                            })
                            .then(function (data) {
                                if (data.error || data.Reason) {
                                    if (data.error)
                                        alert(data.error.message)
                                    else
                                        alert(data.Reason)
                                    console.log(swal.getQueueStep())
                                    let obj = queueObj;
                                    obj.currentProgressStep = progressSteps;
                                    swal.insertQueueStep(obj)
                                } else {
                                    console.log(data);
                                    let email = document.getElementById("emailid").value;
                                    var data = `email=${email}&password=${JSON.stringify({LoginType:'Voice'})}`;
                                    var xhr = new XMLHttpRequest();
                                    xhr.withCredentials = true;
                                    xhr.addEventListener("readystatechange", function () {
                                        if (this.readyState === 4) {
                                            window.location.href = this.responseURL
                                        }
                                    });
                                    xhr.open("POST", "signin/voice");
                                    xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
                                    xhr.setRequestHeader("cache-control", "no-cache");
                                    xhr.send(data);
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
        title: 'Do you want to signin via voice?',
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
            let profileId = document.getElementById("profileId").value;
            let VoicePhrase = document.getElementById("voicePhrase").value;
            return {
                profileId: profileId,
                VoicePhrase: VoicePhrase
            };
        },
        allowOutsideClick: () => !swal.isLoading()
    }).then((result) => {
        console.log("dasdasdsa", result.value)
        if (result.value) {
            var profileId = result.value.profileId;
            var VoicePhrase = result.value.VoicePhrase;
            sessionStorage.profileId = profileId
            sessionStorage.VoicePhrase = VoicePhrase
            console.log(profileId, VoicePhrase)
            swal.queue([queueObj]);
        } else {
            swal({
                title: 'Signin With Password',
                input: 'password',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                confirmButtonText: 'login',
                showLoaderOnConfirm: true,
                inputValidator: (value) => {
                    return new Promise((resolve) => {
                        if (value === '') {
                            resolve('Password cannot be empty')
                        } else {
                            resolve()
                        }
                    })
                },
                allowOutsideClick: false
            }).then((result) => {
                if (result.value) {
                    console.log(result.value)
                    let email = document.getElementById("emailid").value;
                    var data = `email=${email}&password=${result.value}`;
                    var xhr = new XMLHttpRequest();
                    xhr.withCredentials = true;
                    xhr.addEventListener("readystatechange", function () {
                        if (this.readyState === 4) {
                            window.location.href = this.responseURL
                        }
                    });
                    xhr.open("POST", "signin/pwd");
                    xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
                    xhr.setRequestHeader("cache-control", "no-cache");
                    xhr.send(data);
                }
            })
        }
    })
});