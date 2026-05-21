create a login page with 2 fields username and password and pass it to the backend for validation

if user.is_staff is false then redirec tto /dasshboard
if not then to /admin

on dashboard user should be able to see his feedbacks, theri status and basic filtering options needs to be provided.
there will be a form whcih takes subject as text, categry as dropdwon (hardcoded) , rating, message

on admin page admin will have options to update status of the feedbacks

need to setup a midleware to ensure only authenticated suers enter /admin and /dashboard

AUTH:
- 2 tokens will be passed and as of now theyre ebing stored on cookie
- create and login uses the same endpoint

the endpoints are SERVER_URL api/token to login
api/token/refresh to refresh access token
api/feedback to get all feedback of the logged user
api/feedback/:id to get only one feedback
api/feedback/:id on DELETE to delte feedback
api/feedback/:id on PUT to update values
api/feedback on POST to create feedback