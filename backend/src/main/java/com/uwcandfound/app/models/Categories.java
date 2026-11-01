package com.uwcandfound.app.models;

import jakarta.persistence.*;
import lombok.*;


@Entity
@NoArgsConstructor  
@AllArgsConstructor 
@Table(name ="category")
public class Categories {




@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "category_id",nullable = false,unique =true)
private Long categoriesId;


@Column(name="name")
private String name;

}
