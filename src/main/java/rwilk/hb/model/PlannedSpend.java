package rwilk.hb.model;

import java.io.Serializable;
import java.util.Calendar;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "planned_spending", uniqueConstraints = @UniqueConstraint(columnNames = {"date", "id_category", "id_user"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class PlannedSpend implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "plannedSpendSG")
  @SequenceGenerator(name = "plannedSpendSG", sequenceName = "plannedSpendSEQ", allocationSize = 1)
  private Long id;

  @rwilk.hb.validator.Category
  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
  @JoinColumn(name = "id_category", referencedColumnName = "id", nullable = false)
  private Category category;

  @rwilk.hb.validator.User
  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
  @JoinColumn(name = "id_user", nullable = false, referencedColumnName = "id")
  private User user;

  @NotNull
  private Long plannedSpend;

  @NotNull
  private Calendar date;

}
