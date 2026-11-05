package com.uwcandfound.app.models;

import jakarta.persistence.*;
import lombok.*;


@Entity
@NoArgsConstructor  
@AllArgsConstructor 
@Data 
@Table(name ="categories")
public class Categories {


@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "category_id",nullable = false,unique =true)
private Long categoriesId;



@Column(name="name",nullable= false, unique=true,length=80)
private String name;

}
