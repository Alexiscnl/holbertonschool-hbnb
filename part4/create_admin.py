from hbnb.app import create_app, db, bcrypt
from hbnb.app.models.user import User
app = create_app()
with app.app_context():
    email = "admin@hbnb.com"
    password = "admin123"
    is_admin = True
    first_name = "Admin"
    last_name = "User"
    # Vérifie si l'utilisateur existe déjà
    if User.query.filter_by(email=email).first():
        print("User already exists.")
    else:
        # Utilise la méthode de hash du modèle User pour être cohérent
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            is_admin=is_admin
        )
        user.hash_password(password)  # Hash le mot de passe via la méthode du modèle
        db.session.add(user)
        db.session.commit()
        print(f"User {email} created successfully.")
