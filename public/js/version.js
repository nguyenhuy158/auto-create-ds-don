$(() => {
    $.ajax({
        url: `https://raw.githubusercontent.com/nguyenhuy158/auto-create-ds-don/main/VERSION.md`,
        type: 'GET',
        success: (response) => {
            $('#logContainer').html('<pre>' + response + '</pre>');
            console.log(`🚀 🚀 file: 🚀 response`, response);
        },
        error: (error) => {
            console.log(`🚀 🚀 file: 🚀 error`, error.responseJSON);
        }
    });
});
