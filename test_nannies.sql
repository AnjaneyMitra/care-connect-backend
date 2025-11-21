SELECT u.id, p.first_name, p.lat, p.lng, nd.is_available_now, u.is_verified
FROM users u
JOIN profiles p ON u.id = p.user_id
JOIN nanny_details nd ON u.id = nd.user_id
WHERE u.role = 'nanny';
