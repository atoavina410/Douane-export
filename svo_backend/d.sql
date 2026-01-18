DROP USER SVO34 CASCADE;
CREATE USER SVO34 IDENTIFIED BY 123456789;
GRANT CONNECT, RESOURCE TO SVO34;
ALTER USER SVO34 QUOTA UNLIMITED ON USERS;

SELECT value FROM nls_database_parameters WHERE parameter='NLS_CHARACTERSET';

SELECT table_name 
FROM user_tables;


INSERT INTO API_UTILISATEUR (
    ID_UTILISATEUR,
    MATRICULE,
    NOM_UTILISATEUR,
    PRENOM_UTILISATEUR,
    LOGIN,
    MAIL,
    PASSWORD,
    IS_SUPERUSER,
    IS_ACTIVE,
    IS_STAFF,
    ID_ROLE_ID,
    ID_SERVICE_ID
) VALUES (
    1,
    1001,
    'Admin',
    'Principal',
    'admin',
    'admin@example.com',
    'pbkdf2_sha256$1200000$pNO2jFiQpyZNtT8avYL7gt$4W3Z9JlumDf85mye45HDNCItQ9iqRSLXFcRj2Xdsdjw=',
    1,
    1,
    1,
    NULL,
    NULL
);



pbkdf2_sha256$1200000$pNO2jFiQpyZNtT8avYL7gt$4W3Z9JlumDf85mye45HDNCItQ9iqRSLXFcRj2Xdsdjw=

sqlplus SVO34/123456789@//localhost:1521/XEPDB1

python manage.py show_urls

ALTER PLUGGABLE DATABASE XEPDB1 OPEN;



Vérifier le jeu de caractères de la base
ALTER SESSION SET CONTAINER = XEPDB1;
SELECT parameter, value 
FROM nls_database_parameters 
WHERE parameter LIKE '%CHARACTERSET%';

set NLS_LANG=AMERICAN_AMERICA.AL32UTF8

----------------------------------------------------------------------

ALTER SESSION SET CONTAINER = XEPDB1;

CREATE TABLESPACE users
   DATAFILE 'F:\ORACLEXE\ORADATA\XE\XEPDB1\users01.dbf'
   SIZE 100M AUTOEXTEND ON;

SELECT name FROM v$datafile;

CREATE USER django IDENTIFIED BY django_password
   DEFAULT TABLESPACE users
   TEMPORARY TABLESPACE temp
   QUOTA UNLIMITED ON users;

GRANT CONNECT, RESOURCE TO django;
GRANT CREATE SESSION TO django;
GRANT CREATE TABLE TO django;
GRANT CREATE SEQUENCE TO django;
GRANT CREATE VIEW TO django;
GRANT CREATE TRIGGER TO django;
GRANT UNLIMITED TABLESPACE TO django;


--------------SUPPRESSION DES TABLES-----------------
BEGIN
   FOR t IN (SELECT table_name 
             FROM user_tables 
             WHERE table_name LIKE 'API_%' 
                OR table_name LIKE 'AUTH_%' 
                OR table_name LIKE 'DJANGO_%') LOOP
      EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
   END LOOP;
END;

python manage.py createsuperuser


--------------Selectionner les donnees d'une table-----------------
SELECT * FROM API_UTILISATEUR;