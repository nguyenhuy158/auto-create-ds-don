$(() => {
    $("#register-form").on("submit", (e) => {
        e.preventDefault();

        const username = $("#username").val();
        const password = $("#password").val();
        const passwordConfirm = $("#password-confirm").val();

        if (password != passwordConfirm) {
            Swal.fire("Nhập mật khẩu xác nhận đúng nhoa nhoa");
            return;
        }

        $.ajax({
            url: "/register",
            type: "POST",
            data: {
                username,
                password,
            },
            success: (response) => {
                Swal.fire(response.message);
                window.location.href = "/dang-nhap";
            },
            error: (response) => {
                Swal.fire(response.responseJSON?.message);
            },
        });
    });
});
