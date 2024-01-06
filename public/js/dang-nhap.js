$(() => {
    $("#login-form").on("submit", (e) => {
        e.preventDefault();

        const username = $("#username").val();
        const password = $("#password").val();

        console.log(username);
        console.log(password);

        $.ajax({
            url: "/dang-nhap",
            type: "POST",
            data: {
                username,
                password,
            },
            success: (response) => {
                Swal.fire(response.message);
                window.location.href = '/cham-cong'
            },
            error: (response) => {
                Swal.fire(response.responseJSON?.message);
            },
        });
    });
});
