-- 1. Insert a new account
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Modify the account
UPDATE public.account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 3. Delete the account
DELETE FROM public.account
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- Select one record from account
SELECT * FROM public.account WHERE account_lastname = 'Stark';

-- 4.  Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors"
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. Use an inner join to select the make and model fields from the inventory table and the classification name field from the classification table for inventory items that belong to the "Sport" category.
SELECT 
    i.inv_make,
    i.inv_model
FROM public.inventory i
INNER JOIN public.classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6. Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns using a single query
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
